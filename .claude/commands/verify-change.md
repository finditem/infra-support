---
description: 변경된 파일을 기준으로 영향받은 앱을 찾아 빌드+린트로 검증한다
---

작업 디렉토리의 변경 사항(`git status --porcelain`, 스테이징 여부 무관)을 확인하고, 아래 절차로 검증한다.

1. 변경된 파일 경로를 보고 영향받은 대상을 판단한다:
   - `apps/monitor-web/` 하위 변경 → monitor-web
   - `apps/monitor-server/` 하위 변경 → monitor-server
   - `packages/shared/` 하위 변경 → shared, 그리고 shared에 의존하는 monitor-web/monitor-server도 함께 (타입 불일치 여부 확인 목적)
   - `packages/design-tokens/` 하위 변경 → design-tokens
   - 루트 설정 파일(`turbo.json`, `pnpm-workspace.yaml` 등) 변경 → 전체 앱

2. 영향받은 각 대상에서 순서대로 실행한다: `pnpm build` → `pnpm lint`. (design-tokens는 `pnpm build`만 존재)
   - **monitor-server, shared는 `pnpm lint`가 ESLint 설정 파일 부재로 원래부터 실패한다.** 이 두 곳은 `pnpm build`만으로 검증하고 lint 실패는 무시한다 (앱별 CLAUDE.md 참고).

3. 실패하면:
   - 에러 메시지를 읽고 원인을 분석한다.
   - 원인이 이번 변경과 직접 관련 있으면 수정하고 같은 명령으로 재검증한다.
   - 기존에 이미 존재하던 문제(이번 변경과 무관)라면 고치지 말고 사용자에게 보고한다.

4. 마지막에 결과를 요약한다: 검증한 대상, 통과/실패 여부, 수정한 내용, 남은 이슈.

이 커맨드는 `git add`/`commit`/`push`/PR 생성을 수행하지 않는다. 커밋은 사용자가 직접 한다.
