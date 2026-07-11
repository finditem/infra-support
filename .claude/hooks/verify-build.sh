#!/usr/bin/env bash
set -euo pipefail

INPUT="$(cat)"
STOP_HOOK_ACTIVE="$(echo "$INPUT" | jq -r '.stop_hook_active // false')"

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

set +e
BUILD_OUTPUT="$(pnpm build 2>&1)"
BUILD_EXIT=$?
set -e

if [ "$BUILD_EXIT" -ne 0 ]; then
  TAIL="$(echo "$BUILD_OUTPUT" | tail -40)"
  jq -n --arg reason "pnpm build 실패. 아래 에러를 고치고 다시 검증하세요:

$TAIL" '{decision: "block", reason: $reason}'
  exit 0
fi

exit 0
