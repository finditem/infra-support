# infra-support

[찾아줘!](https://www.finditem.kr/) 서비스의 외부 API 모니터링을 지원하는 Turborepo + pnpm 모노레포.

## 구조

```
apps/
  monitor-server/   # Next.js API — 모니터링 실행 및 결과 저장 (apps/monitor-server/CLAUDE.md)
  monitor-web/      # Vite/React — 모니터링 데이터 시각화 대시보드 (apps/monitor-web/CLAUDE.md)
  schedule/         # Next.js App Router — 팀 일정 관리 툴, 별도 Supabase 프로젝트 사용 (apps/schedule/CLAUDE.md)
packages/
  shared/           # 앱 간 공유 TypeScript 타입 (packages/shared/CLAUDE.md)
  design-tokens/    # 디자인 토큰 (Style Dictionary)
```

작업 대상 앱/패키지의 CLAUDE.md를 반드시 함께 참고할 것. 각 CLAUDE.md는 해당 디렉토리의 구조, 컨벤션, 검증 커맨드를 담고 있다.

## 텍스트 작성 원칙

커밋 메시지, PR 본문, plan.md, 코드 주석 등 Claude가 작성하는 모든 텍스트 산출물은 온전한 문장으로만 작성하고 이모티콘을 사용하지 않는다.

## 공통 커맨드

루트에서 turbo로 전체 앱에 대해 실행된다:

```bash
pnpm dev      # 전체 개발 서버
pnpm build    # 전체 빌드 (타입체크 포함)
pnpm lint     # 전체 린트
```

특정 앱만 검증할 때는 해당 앱 디렉토리에서 `pnpm build` / `pnpm lint`를 실행한다 (앱별 CLAUDE.md의 검증 커맨드 참고).

`pnpm dev`는 사용자가 이미 띄워서 항상 켜둔 상태라고 가정한다. Claude가 직접 `pnpm dev`(혹은 앱별 dev 서버)를 실행하지 않는다 — 장기 실행 프로세스라 세션 종료 후에도 백그라운드에 남거나, 여러 세션이 동시에 각자 띄우면 포트 충돌이 발생할 수 있다. 개발 서버 동작 확인이 필요하면 이미 떠 있다고 가정하고 진행하거나, 필요 시 사용자에게 확인을 요청한다.

## 표준 작업 흐름

1. 요구사항과 관련된 앱을 특정하고, 해당 앱의 CLAUDE.md 컨벤션을 확인한다.
2. 기존 코드 패턴과 디렉토리 구조를 그대로 따른다. 새 추상화나 새로운 디렉토리 규칙을 임의로 만들지 않는다.
3. 구현이 끝나고 응답을 마치기 전에, 영향받은 앱에 대해 빌드/린트/타입체크/테스트를 실행할지 사용자에게 먼저 물어본다. 여러 세션을 동시에 띄워 같은 워킹 디렉토리를 공유할 수 있어, 세션이 끝날 때마다 자동으로 전체 빌드를 돌리면 다른 세션이 작업 중인 미완성 코드까지 함께 걸려 엉뚱하게 실패로 잡힐 수 있기 때문이다. 사용자가 실행을 요청하면 그때 돌리고, 실패하면 원인을 고친 뒤 재검증한다.
4. 로컬 `git commit`은 응답 흐름에 맞춰 자율적으로 수행할 수 있다. 단, 반드시 이번 응답에서 Claude가 Edit/Write로 직접 건드린 파일만 `git add`한다 (`git add -A`/`git add .` 금지, 파일 경로를 명시해서 add). 사용자가 별도로 작업 중이던 파일(Claude가 만지지 않은 변경분)은 어떤 이유로도 함께 커밋하지 않는다. 여러 세션이 같은 워킹 디렉토리를 공유할 수 있으므로, 커밋 직전 반드시 `git status`로 staging 대상이 의도한 파일과 정확히 일치하는지 확인한다.
5. `git push` / PR 생성 / force-push / `git reset --hard` 등 원격 저장소나 공유 이력에 영향을 주는 작업, `.env` 등 민감 파일 삭제·수정은 사용자가 명시적으로 요청하기 전에는 수행하지 않는다.

## PR 생성

사용자가 PR 생성을 요청하면 `create-pr` 스킬을 실행한다. `gh pr create` 실행 자체는 항상 사용자 확인 후 진행한다 (5번 규칙).

### 라벨 부여

PR을 생성한 뒤에는 변경 내용에 맞는 라벨을 `gh pr edit <번호> --add-label <라벨>`로 자동 부여한다. 라벨은 브랜치에 포함된 커밋의 type을 기준으로 정하고, 성격이 다른 커밋이 섞여 있으면 해당하는 라벨을 모두 붙인다.

| 커밋 type | 라벨 |
| --- | --- |
| `feat` | `feature` |
| `fix`, `hotfix` | `bug` |
| `docs` | `docs` |
| `refactor` | `refactor` |
| `chore`, `test`, `asset` | `chore` |
| `rename` | `rename` |
| `design` | `design` |
| `a11y` | `a11y` |

다음 라벨은 커밋 type으로 결정되지 않으므로, 변경 내용이 실제로 해당할 때만 추가로 붙인다.

- `performance`: 성능 최적화, 로딩 속도 개선, 코드 스플리팅
- `UI/UX`: 인터랙션 개선, 사용자 경험 개선
- `design QA`: 디자이너 피드백 반영, 디자인 QA 점검 사항 수정
- `main`: main 브랜치 동기화 작업

`D-0`, `D-1`, `D-3`, `D-5`는 처리 기한을 나타내는 라벨이므로 Claude가 임의로 부여하지 않는다. 긴급도는 사람이 판단한다.

라벨 목록은 `gh label list`로 확인할 수 있다. 위 표에 없는 변경이라면 임의로 새 라벨을 만들지 말고 가장 가까운 기존 라벨을 쓰거나, 마땅한 것이 없으면 라벨 없이 두고 보고에 그 사실을 밝힌다.

## 커밋 컨벤션 (monitor-web 기준, commitlint 강제)

- type: `feat`, `fix`, `docs`, `hotfix`, `refactor`, `test`, `chore`, `rename`, `asset`, `design`, `a11y` 중 하나
- scope 필수 (비워두면 커밋 실패)
- 예: `feat(dashboard): API 상태 카드 추가`
- 커밋 메시지 본문은 작성하지 않고 제목 한 줄로 작업 내용을 요약한다. 변경 배경, 세부 사항, 다른 앱과의 차이점 등 상세한 설명은 커밋 메시지가 아니라 PR 본문(`create-pr` 스킬)에 작성한다.

## 기타 도구

- CI(`.github/workflows/develop-to-main-pr.yml`)는 lint/build/test 검증 없이 develop→main PR만 자동 생성한다. 즉 로컬에서의 검증(위 3번)이 사실상 유일한 안전망이므로, 사용자가 검증을 생략하자고 하지 않는 한 매번 물어본다.
