# infra-support

[찾아줘!](https://www.finditem.kr/) 서비스의 외부 API 모니터링을 지원하는 Turborepo + pnpm 모노레포.

## 구조

```
apps/
  monitor-server/   # Next.js API — 모니터링 실행 및 결과 저장 (apps/monitor-server/CLAUDE.md)
  monitor-web/      # Vite/React — 모니터링 데이터 시각화 대시보드 (apps/monitor-web/CLAUDE.md)
packages/
  shared/           # 앱 간 공유 TypeScript 타입 (packages/shared/CLAUDE.md)
  design-tokens/    # 디자인 토큰 (Style Dictionary)
```

작업 대상 앱/패키지의 CLAUDE.md를 반드시 함께 참고할 것. 각 CLAUDE.md는 해당 디렉토리의 구조, 컨벤션, 검증 커맨드를 담고 있다.

## 공통 커맨드

루트에서 turbo로 전체 앱에 대해 실행된다:

```bash
pnpm dev      # 전체 개발 서버
pnpm build    # 전체 빌드 (타입체크 포함)
pnpm lint     # 전체 린트
```

특정 앱만 검증할 때는 해당 앱 디렉토리에서 `pnpm build` / `pnpm lint`를 실행한다 (앱별 CLAUDE.md의 검증 커맨드 참고).

## 표준 작업 흐름

1. 요구사항과 관련된 앱을 특정하고, 해당 앱의 CLAUDE.md 컨벤션을 확인한다.
2. 기존 코드 패턴과 디렉토리 구조를 그대로 따른다. 새 추상화나 새로운 디렉토리 규칙을 임의로 만들지 않는다.
3. 구현 후에는 반드시 영향받은 앱의 빌드+린트를 직접 실행해 검증한다. 실패하면 원인을 고치고 재검증한다.
4. `git add` / `git commit` / `git push` / PR 생성은 사용자가 명시적으로 요청하기 전에는 수행하지 않는다. 커밋 시점과 내용은 사람이 직접 확인하고 결정한다.

응답을 마칠 때마다 `.claude/hooks/verify-build.sh`가 Stop 훅으로 자동 실행되어 전체 `pnpm build`를 돌린다. 빌드가 실패하면 세션이 끝나지 못하고 에러 내용이 자동으로 전달되니, 그 내용을 보고 고친 뒤 다시 응답을 마치면 된다 (lint는 훅 대상이 아님 — monitor-server/shared의 ESLint 설정 부재 때문).

이 훅은 무한 루프 방지를 위해 재검증을 한 번만 강제한다 — 수정 후 재시도했는데도 빌드가 여전히 실패하면 훅은 그대로 통과시키고 세션이 끝난다. 이 경우 절대 조용히 넘어가지 않는다: 응답 마지막에 **"빌드가 실패한 채로 남아 있다"는 사실, 실패한 정확한 에러 메시지, 원인 추정, 무엇을 시도했는지**를 반드시 사용자에게 명시적으로 보고한다. "구현 완료"처럼 성공을 암시하는 문구를 쓰지 않는다.

## 커밋 컨벤션 (monitor-web 기준, commitlint 강제)

- type: `feat`, `fix`, `docs`, `hotfix`, `refactor`, `test`, `chore`, `rename`, `asset`, `design`, `a11y` 중 하나
- scope 필수 (비워두면 커밋 실패)
- 예: `feat(dashboard): API 상태 카드 추가`

## 기타 도구

- `.gemini/`: Gemini Code Assist의 PR 자동 리뷰 설정. CLAUDE.md와 별도로 유지되며 PR 리뷰 시점에만 관여한다.
- CI(`.github/workflows/develop-to-main-pr.yml`)는 lint/build/test 검증 없이 develop→main PR만 자동 생성한다. 즉 로컬에서의 자체 검증(위 3번)이 사실상 유일한 안전망이다.
