#!/usr/bin/env bash
# Ритуал проверок перед коммитом — одной командой.
#
#   ./scripts/preflight.sh          # быстрый прогон (без сети)
#   ./scripts/preflight.sh --links  # плюс проверка внешних ссылок (ходит в сеть)
#
# Код возврата 0 — можно коммитить. Иначе печатает, какой гейт красный.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

WITH_LINKS=0
[[ "${1:-}" == "--links" ]] && WITH_LINKS=1

FAILED=()

step() {
  local name="$1"
  shift
  printf '\n\033[1m→ %s\033[0m\n' "$name"
  if "$@"; then
    printf '\033[32m  ✔ %s\033[0m\n' "$name"
  else
    printf '\033[31m  ✘ %s — ПРОВАЛ\033[0m\n' "$name"
    FAILED+=("$name")
  fi
}

# 1. Артефакты, которые не должны попадать в индекс.
check_staged_artifacts() {
  local bad
  bad=$(git diff --cached --name-only | grep -E '(^|/)(node_modules|\.playwright-mcp)/|\.pyc$' || true)
  if [[ -n "$bad" ]]; then
    echo "  В индексе артефакты, которых там быть не должно:"
    echo "$bad" | sed 's/^/    /'
    return 1
  fi
  echo "  Индекс чист"
}

step "Артефакты в git-индексе" check_staged_artifacts
step "Prettier (конфиги и документация)" npm run --silent format:check
step "Stylelint (CSS)" npm run --silent lint:css
step "ESLint (JS)" npm run --silent lint:js
step "html-validate (HTML)" npm run --silent lint:html
step "Синхронность мета-данных" python3 scripts/check_meta_sync.py
step "Зеркала правил и скиллов" python3 scripts/check_agents_sync.py

if [[ $WITH_LINKS -eq 1 ]]; then
  step "Внешние ссылки" python3 scripts/check_links.py
else
  printf '\n\033[33m→ Внешние ссылки — пропущено (запусти с --links перед публикацией)\033[0m\n'
fi

echo
if [[ ${#FAILED[@]} -eq 0 ]]; then
  printf '\033[32m\033[1mpreflight: все гейты зелёные\033[0m\n'
  exit 0
fi

printf '\033[31m\033[1mpreflight: провалено гейтов — %d\033[0m\n' "${#FAILED[@]}"
for name in "${FAILED[@]}"; do
  printf '  - %s\n' "$name"
done
exit 1
