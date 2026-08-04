#!/usr/bin/env python3
"""Гейт целостности зеркал правил и скиллов AI-агентов.

`AGENTS.md` — единственный источник истины. Остальные файлы правил (`CLAUDE.md`,
`GEMINI.md`, `QWEN.md`, `.github/copilot-instructions.md`) должны быть
**symlink'ами** на него, а не копиями: копия расходится с источником на первой
же правке, и агенты начинают работать по разным правилам.

То же со скиллами: `.claude/skills/<name>` — symlink на `.agents/skills/<name>`.

Проверки:
  1. `AGENTS.md` существует и является обычным файлом.
  2. Каждое зеркало правил — symlink, ведущий именно на `AGENTS.md`.
  3. У каждого скилла из `.agents/skills/` есть symlink в `.claude/skills/`.
  4. В `.claude/skills/` нет «сирот» — ссылок на удалённые скиллы.
  5. Каждый `SKILL.md` имеет YAML-заголовок с `name` и `description`,
     и `name` совпадает с именем каталога.
  6. Все скиллы перечислены в `AGENTS.md` (иначе агент о них не узнает).
  7. Внутри репозитория нет путей, работающих только на машине автора: домашнего
     каталога, дисков Windows, UNC-путей к WSL, ссылок на локальный файл.
     Не сканируется единственный файл — этот: список шаблонов ниже содержит
     запрещённые пути по определению. Пути внутри контейнеров (`/home/app/...`
     в docker-compose и nginx) легитимны и не ловятся.

Запуск: python3 scripts/check_agents_sync.py
Код возврата: 0 — зеркала целы, 1 — есть расхождения.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = "AGENTS.md"
MIRRORS = {
    "CLAUDE.md": "AGENTS.md",
    "GEMINI.md": "AGENTS.md",
    "QWEN.md": "AGENTS.md",
    ".github/copilot-instructions.md": "../AGENTS.md",
}
SKILLS_SRC = ROOT / ".agents" / "skills"
SKILLS_MIRROR = ROOT / ".claude" / "skills"

# Единственный файл, который проверка не сканирует, — она сама: список шаблонов
# ниже по определению содержит запрещённые пути, и любая попытка обойти это
# заканчивается ослаблением гейта.
SELF = "scripts/check_agents_sync.py"


# Абсолютные пути, которые работают только на машине автора. Пути внутри
# контейнеров (например /home/app/... в docker-compose и nginx) легитимны и
# специально не ловятся: критерий — «сломается ли это у другого человека».
# Lookbehind'ы отсекают ложные срабатывания на регулярках в других скриптах:
# в `^name:\s*` есть буква, двоеточие и слеш, но это не путь к диску Windows.
def machine_specific_patterns() -> re.Pattern[str]:
    parts = [
        re.escape(str(Path.home()) + "/"),  # домашний каталог автора
        re.escape(str(ROOT)),  # абсолютный путь к самому репозиторию
        r"/mnt/[a-z]/",  # смонтированные диски Windows в WSL
        r"(?<![\w\\])[A-Za-z]:\\{1,2}[\w.$~-]",  # диск Windows: буква, двоеточие, путь
        r"(?<!\\)\\\\wsl",  # UNC-путь к WSL
        r"file:///",  # ссылка на локальный файл
    ]
    return re.compile("|".join(parts))


ABSOLUTE_PATH = machine_specific_patterns()


def check_source(errors: list[str]) -> None:
    path = ROOT / SOURCE
    if not path.is_file() or path.is_symlink():
        errors.append(f"{SOURCE} должен существовать и быть обычным файлом (не symlink)")


def check_mirrors(errors: list[str]) -> None:
    for name, expected in MIRRORS.items():
        path = ROOT / name
        if not path.exists():
            errors.append(f"{name}: зеркало отсутствует (ожидается symlink → {expected})")
            continue
        if not path.is_symlink():
            errors.append(
                f"{name}: это копия, а не symlink. Копия разойдётся с {SOURCE} — "
                f"замени: ln -sf {expected} {name}"
            )
            continue
        target = str(path.readlink())
        if target != expected:
            errors.append(f"{name}: symlink ведёт на {target}, ожидается {expected}")


def check_skill_mirrors(errors: list[str]) -> list[str]:
    if not SKILLS_SRC.is_dir():
        errors.append(".agents/skills/ отсутствует")
        return []

    names = sorted(p.name for p in SKILLS_SRC.iterdir() if p.is_dir())
    for name in names:
        mirror = SKILLS_MIRROR / name
        if not mirror.exists() and not mirror.is_symlink():
            errors.append(
                f".claude/skills/{name}: зеркало скилла отсутствует — "
                f"ln -sfn ../../.agents/skills/{name} .claude/skills/{name}"
            )
            continue
        if not mirror.is_symlink():
            errors.append(f".claude/skills/{name}: должен быть symlink, а не каталог с копией")
            continue
        expected = f"../../.agents/skills/{name}"
        target = str(mirror.readlink())
        if target != expected:
            errors.append(
                f".claude/skills/{name}: symlink ведёт на {target}, ожидается {expected}"
            )

    if SKILLS_MIRROR.is_dir():
        for mirror in sorted(SKILLS_MIRROR.iterdir()):
            if mirror.name not in names:
                errors.append(
                    f".claude/skills/{mirror.name}: зеркало ссылается на несуществующий скилл"
                )
    return names


def check_skill_headers(names: list[str], errors: list[str]) -> None:
    for name in names:
        skill = SKILLS_SRC / name / "SKILL.md"
        if not skill.is_file():
            errors.append(f".agents/skills/{name}/SKILL.md отсутствует")
            continue
        text = skill.read_text(encoding="utf-8")
        header = re.match(r"---\n(.*?)\n---\n", text, re.S)
        if not header:
            errors.append(f".agents/skills/{name}/SKILL.md: нет YAML-заголовка")
            continue
        block = header.group(1)
        declared = re.search(r"^name:\s*(.+)$", block, re.M)
        if not declared:
            errors.append(f".agents/skills/{name}/SKILL.md: в заголовке нет name")
        elif declared.group(1).strip() != name:
            errors.append(
                f".agents/skills/{name}/SKILL.md: name={declared.group(1).strip()} "
                f"не совпадает с именем каталога"
            )
        if not re.search(r"^description:\s*\S", block, re.M):
            errors.append(f".agents/skills/{name}/SKILL.md: в заголовке нет description")


def check_skills_listed(names: list[str], errors: list[str]) -> None:
    text = (ROOT / SOURCE).read_text(encoding="utf-8")
    missing = [name for name in names if name not in text]
    if missing:
        errors.append(
            f"{SOURCE}: скиллы не упомянуты, агент о них не узнает — " + ", ".join(missing)
        )


def check_absolute_paths(errors: list[str]) -> None:
    try:
        tracked = subprocess.run(
            ["git", "ls-files"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=True,
        ).stdout.split()
    except (OSError, subprocess.CalledProcessError):
        print("  ! git недоступен, проверка абсолютных путей пропущена", file=sys.stderr)
        return

    # Подмодули — чужие репозитории со своей историей, их правила нас не касаются.
    submodules = {
        line.split()[1]
        for line in (ROOT / ".gitmodules").read_text(encoding="utf-8").splitlines()
        if line.strip().startswith("path")
        for line in [line.replace("=", " ")]
    }

    hits: list[str] = []
    for name in tracked:
        if name == SELF:
            continue
        if any(name.startswith(f"{sub}/") or name == sub for sub in submodules):
            continue
        path = ROOT / name
        if not path.is_file() or path.is_symlink():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for number, line in enumerate(text.splitlines(), 1):
            if ABSOLUTE_PATH.search(line):
                hits.append(f"{name}:{number}")

    if hits:
        errors.append(
            "Абсолютные пути в репозитории (нужны относительные): " + ", ".join(hits[:10])
        )


def main() -> int:
    errors: list[str] = []
    check_source(errors)
    check_mirrors(errors)
    names = check_skill_mirrors(errors)
    check_skill_headers(names, errors)
    if not errors or names:
        check_skills_listed(names, errors)
    check_absolute_paths(errors)

    if errors:
        print("check_agents_sync: расхождения", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(
        f"check_agents_sync: {len(MIRRORS)} зеркала правил и {len(names)} скилла синхронны, "
        "абсолютных путей нет"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
