#!/usr/bin/env python3
"""Гейт синхронности мета-данных сайта.

Заголовок и дата модификации дублируются в index.html (<title>, og:title,
twitter:title, JSON-LD ProfilePage.name), в sitemap.xml (<lastmod>) и в
manifest.webmanifest. Руками эти пять мест расходятся на первой же правке,
поэтому инвариант проверяется скриптом, а не глазами.

Проверки:
  1. <title>, og:title, twitter:title и JSON-LD ProfilePage.name совпадают.
  2. dateModified в JSON-LD == <lastmod> в sitemap.xml.
  3. JSON-LD парсится как валидный JSON (иначе поисковики молча его игнорируют).
  4. Все внутренние якоря (href="#...") ведут на существующие id.
  5. У каждой внешней ссылки target="_blank" есть rel с noopener.

Запуск: python3 scripts/check_meta_sync.py
Код возврата: 0 — всё синхронно, 1 — есть расхождения (печатаются в stderr).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
SITEMAP = ROOT / "sitemap.xml"


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def extract_jsonld(html: str, errors: list[str]) -> dict | None:
    match = re.search(
        r'<script type="application/ld\+json">(.*?)</script>', html, re.S
    )
    if not match:
        fail(errors, "JSON-LD: блок <script type=\"application/ld+json\"> не найден")
        return None
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as exc:
        fail(errors, f"JSON-LD: невалидный JSON — {exc}")
        return None


def graph_node(data: dict, node_type: str) -> dict | None:
    for node in data.get("@graph", []):
        if node.get("@type") == node_type:
            return node
    return None


def check_titles(html: str, data: dict | None, errors: list[str]) -> None:
    title = re.search(r"<title>(.*?)</title>", html, re.S)
    og = re.search(r'<meta property="og:title" content="(.*?)"', html)
    tw = re.search(r'<meta name="twitter:title" content="(.*?)"', html)
    if not (title and og and tw):
        fail(errors, "Заголовки: не найден <title>, og:title или twitter:title")
        return

    values = {
        "<title>": title.group(1).strip(),
        "og:title": og.group(1).strip(),
        "twitter:title": tw.group(1).strip(),
    }
    if data:
        page = graph_node(data, "ProfilePage")
        if page and page.get("name"):
            values["JSON-LD ProfilePage.name"] = page["name"].strip()

    unique = set(values.values())
    if len(unique) > 1:
        listing = "\n".join(f"    {k}: {v}" for k, v in values.items())
        fail(errors, f"Заголовки расходятся между собой:\n{listing}")


def check_dates(data: dict | None, errors: list[str]) -> None:
    if not data:
        return
    page = graph_node(data, "ProfilePage")
    modified = (page or {}).get("dateModified")
    if not modified:
        fail(errors, "JSON-LD: у ProfilePage нет dateModified")
        return

    sitemap = SITEMAP.read_text(encoding="utf-8")
    lastmod = re.search(r"<lastmod>(.*?)</lastmod>", sitemap)
    if not lastmod:
        fail(errors, "sitemap.xml: не найден <lastmod>")
        return

    if modified.strip() != lastmod.group(1).strip():
        fail(
            errors,
            "Дата модификации расходится: "
            f"JSON-LD dateModified={modified}, sitemap lastmod={lastmod.group(1)}",
        )


def check_anchors(html: str, errors: list[str]) -> None:
    ids = set(re.findall(r'\sid="([^"]+)"', html))
    anchors = {a for a in re.findall(r'href="#([^"]+)"', html) if a}
    missing = sorted(anchors - ids)
    if missing:
        fail(errors, "Битые внутренние якоря (нет таких id): " + ", ".join(missing))


def check_blank_rel(html: str, errors: list[str]) -> None:
    bad = [
        tag
        for tag in re.findall(r"<a\b[^>]*target=\"_blank\"[^>]*>", html)
        if "noopener" not in tag
    ]
    if bad:
        listing = "\n".join(f"    {tag[:110]}" for tag in bad[:5])
        fail(
            errors,
            f'target="_blank" без rel="noopener" ({len(bad)} шт.):\n{listing}',
        )


def main() -> int:
    html = INDEX.read_text(encoding="utf-8")
    errors: list[str] = []

    data = extract_jsonld(html, errors)
    check_titles(html, data, errors)
    check_dates(data, errors)
    check_anchors(html, errors)
    check_blank_rel(html, errors)

    if errors:
        print("check_meta_sync: расхождения", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print("check_meta_sync: заголовки, даты, якоря и rel=noopener синхронны")
    return 0


if __name__ == "__main__":
    sys.exit(main())
