#!/usr/bin/env sh
set -e

staged=$(git diff --cached --name-only --diff-filter=ACMR -- '*.ts' '*.tsx')

if [ -z "$staged" ]; then
  exit 0
fi

pnpm typecheck
printf '%s\n' "$staged" | tr '\n' '\0' | xargs -0 pnpm exec eslint
printf '%s\n' "$staged" | tr '\n' '\0' | xargs -0 pnpm exec vitest related --run --passWithNoTests
