#!/usr/bin/env python3
"""Проверка внешних ссылок сайта и README.

Резюме с битой ссылкой мгновенно теряет доверие: репозиторий переименовали,
демо на VPS упало, домен сменился — а в HTML осталось как было. Проверка
детерминированная, поэтому её делает скрипт, а не глаза.

Ходит по сети, поэтому НЕ является блокирующим гейтом в CI на каждый push:
внешние сервисы отдают 429/5xx по своим причинам. Запускать локально перед
публикацией и по расписанию.

Что считается поломкой: код ответа 4xx/5xx и ссылка на файл этого репозитория,
которого больше нет. Что считается предупреждением: обрыв соединения и таймаут
(это про качество сети, а не про ссылку), а также домены, закрытые для роботов.
Предупреждения печатаются, но не роняют гейт — их проверяет человек. Обратная
сторона: у провайдеров, подменяющих ответ DNS на несуществующий домен, целиком
умерший домен тоже попадёт в предупреждения, а не в поломки.

Запуск:
    python3 scripts/check_links.py             # index.html + README.md
    python3 scripts/check_links.py index.html  # только указанные файлы

Код возврата: 0 — все ссылки живы, 1 — есть недоступные.
"""

from __future__ import annotations

import re
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_FILES = ["index.html", "README.md"]
TIMEOUT = 25
ATTEMPTS = 3
RETRY_PAUSE = 1.5
WORKERS = 6
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/128.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml,image/svg+xml,*/*;q=0.8",
    "Accept-Language": "ru,en;q=0.9",
}

# Локальные адреса из примеров в документации — в сети их и не должно быть.
SKIP_HOSTS = ("localhost", "127.0.0.1", "0.0.0.0")

# Ссылки на файлы этого же репозитория. По сети они отдают 404 до пуша, поэтому
# проверяются по локальной файловой системе: так гейт ловит настоящую ошибку
# (сослались на переименованный или удалённый файл) и не шумит на новых.
SELF_BLOB = re.compile(
    r"^https://github\.com/radif-ru/www/(?:blob|tree)/[^/]+/(?P<path>.+)$"
)

# Отвечают 4xx роботам, но живы для людей: считаем предупреждением, не поломкой.
TOLERATE = ("hh.ru", "linkedin.com", "instagram.com", "vk.com", "max.ru")

# Мёртвая ссылка отвечает 404 или не резолвится — это поломка. Обрыв соединения
# и таймаут говорят только о качестве сети между мной и сервером, поэтому идут
# в предупреждения: иначе гейт краснеет от домашнего Wi-Fi, а не от дефекта.
UNREACHABLE = "сеть: "


def prefer_ipv4_if_broken() -> None:
    """Проверяет, работает ли IPv6, и если нет — оставляет только IPv4-адреса.

    В WSL IPv6 обычно настроен, но не маршрутизируется, а часть хостов (например
    shields.io и pypi.org) отдаёт в DNS только AAAA-записи. Соединение висит до
    таймаута, и гейт показывает «ссылка мертва» там, где мертва сеть. Гейт,
    который врёт через раз, перестают читать — поэтому лечим причину.
    """
    try:
        with socket.socket(socket.AF_INET6, socket.SOCK_STREAM) as probe:
            probe.settimeout(3)
            probe.connect(("2606:4700:4700::1111", 443))  # Cloudflare DNS over TLS
        return
    except OSError:
        print("  ! IPv6 недоступен, проверяю ссылки по IPv4")

    resolve = socket.getaddrinfo

    def ipv4_only(*args: object, **kwargs: object) -> list:
        found = resolve(*args, **kwargs)  # type: ignore[arg-type]
        return [entry for entry in found if entry[0] == socket.AF_INET] or found

    socket.getaddrinfo = ipv4_only  # type: ignore[assignment]


def collect(files: list[str]) -> dict[str, set[str]]:
    urls: dict[str, set[str]] = {}
    for name in files:
        path = ROOT / name
        if not path.exists():
            print(f"  ! файл не найден: {name}", file=sys.stderr)
            continue
        text = path.read_text(encoding="utf-8")
        found = set(re.findall(r'https?://[^\s"\')<>\]]+', text))
        for raw in found:
            url = raw.rstrip(".,;")
            host = urllib.parse.urlsplit(url).hostname or ""
            if host in SKIP_HOSTS:
                continue
            urls.setdefault(url, set()).add(name)
    return urls


def encode(url: str) -> str:
    """Приводит URL к ASCII: кириллица в пути и не-ASCII символы в query."""
    parts = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit(
        (
            parts.scheme,
            parts.netloc.encode("idna").decode("ascii") if parts.netloc else "",
            urllib.parse.quote(parts.path, safe="/%:@&=+$,~*()'"),
            urllib.parse.quote(parts.query, safe="/?:@&=+$,%~*()'"),
            parts.fragment,
        )
    )


def probe(url: str) -> tuple[str, int | str]:
    self_link = SELF_BLOB.match(url)
    if self_link:
        target = ROOT / urllib.parse.unquote(self_link.group("path"))
        return url, 200 if target.exists() else "нет такого файла в репозитории"

    request = urllib.request.Request(encode(url), headers=HEADERS, method="GET")
    # HTTP-ответ окончателен, сетевой сбой — нет: обрыв соединения или таймаут
    # случается сам по себе, и гейт, который врёт через раз, перестают читать.
    for attempt in range(ATTEMPTS):
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
                return url, response.status
        except urllib.error.HTTPError as exc:
            return url, exc.code
        except Exception as exc:  # noqa: BLE001 — сетевую ошибку показываем как есть
            reason = getattr(exc, "reason", exc)
            if isinstance(reason, socket.gaierror):
                return url, "домен не резолвится"
            if attempt == ATTEMPTS - 1:
                return url, f"{UNREACHABLE}{type(reason).__name__}"
            time.sleep(RETRY_PAUSE * (attempt + 1))
    return url, f"{UNREACHABLE}не проверено"


def main() -> int:
    prefer_ipv4_if_broken()
    files = sys.argv[1:] or DEFAULT_FILES
    urls = collect(files)
    if not urls:
        print("check_links: ссылок не найдено")
        return 0

    print(f"check_links: проверяю {len(urls)} ссылок из {', '.join(files)}")
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        results = dict(pool.map(probe, sorted(urls)))

    broken: list[str] = []
    tolerated: list[str] = []
    for url, status in sorted(results.items()):
        ok = isinstance(status, int) and status < 400
        if ok:
            continue
        where = ", ".join(sorted(urls[url]))
        line = f"{status}  {url}  ({where})"
        soft = isinstance(status, str) and status.startswith(UNREACHABLE)
        if soft or any(domain in url for domain in TOLERATE):
            tolerated.append(line)
        else:
            broken.append(line)

    if tolerated:
        print("\ncheck_links: проверить вручную (закрыты для роботов или не отвечает сеть):")
        for line in tolerated:
            print(f"  ? {line}")

    if broken:
        print("\ncheck_links: недоступные ссылки", file=sys.stderr)
        for line in broken:
            print(f"  - {line}", file=sys.stderr)
        return 1

    if tolerated:
        print(
            f"\ncheck_links: поломок нет — {len(urls) - len(tolerated)} из {len(urls)} "
            f"ссылок ответили, остальные в списке выше"
        )
    else:
        print(f"\ncheck_links: все {len(urls)} ссылок отвечают")
    return 0


if __name__ == "__main__":
    sys.exit(main())
