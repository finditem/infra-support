#!/usr/bin/env bash
set -euo pipefail

if ! command -v jq &> /dev/null; then
  echo "경고: 'jq'가 설치되어 있지 않아 빌드 검증 훅을 실행할 수 없습니다." >&2
  exit 0
fi

cat > /dev/null

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

STATE_FILE=".git/claude_verify_build_failed"

set +e
BUILD_OUTPUT="$(pnpm build 2>&1)"
BUILD_EXIT=$?
set -e

if [ "$BUILD_EXIT" -ne 0 ]; then
  if [ -f "$STATE_FILE" ]; then
    rm -f "$STATE_FILE"
    exit 0
  fi

  touch "$STATE_FILE"
  TAIL="$(echo "$BUILD_OUTPUT" | tail -40)"
  jq -n --arg reason "pnpm build 실패. 아래 에러를 고치고 다시 검증하세요:

$TAIL" '{decision: "block", reason: $reason}'
  exit 0
fi

rm -f "$STATE_FILE"
exit 0
