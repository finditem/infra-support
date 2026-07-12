# monitor-server

찾아줘! API 상태 점검을 실행하고 결과를 저장하는 Next.js 앱. UI 없이 API route만 사용한다 (`/api/monitor`가 크론으로 호출됨).

## 기술 스택

- **Framework**: Next.js 15 (API routes only)
- **Language**: TypeScript
- **DB Client**: Supabase JS

## 디렉토리 구조와 레이어 규칙

```
src/
  app/api/{route}/route.ts   # 엔드포인트 — 인증 체크 + service 호출 + 응답 반환만 담당
  services/                   # 비즈니스 로직 (*.service.ts, *.processor.ts)
  repositories/                # Supabase 데이터 접근 (*.repository.ts)
  lib/                         # 외부 클라이언트 초기화 (supabase.ts)
  utils/                       # 순수 유틸 함수
```

새 기능을 추가할 때는 반드시 이 3단 레이어를 지킨다:

1. **route.ts** ([src/app/api/monitor/route.ts](src/app/api/monitor/route.ts)) — 얇게 유지한다. 인증 헤더 검증 → try/catch로 service 함수 호출 → `NextResponse.json`으로 응답. 비즈니스 로직을 route.ts에 직접 작성하지 않는다.
2. **services/** ([src/services/monitoring.service.ts](src/services/monitoring.service.ts)) — 실제 로직. repository를 조합해 사용한다. 함수 하나가 하나의 유스케이스를 담당.
3. **repositories/** ([src/repositories/monitoring.repository.ts](src/repositories/monitoring.repository.ts)) — Supabase 쿼리를 여기서만 실행한다. `createSupabaseClient()`([src/lib/supabase.ts](src/lib/supabase.ts))로 클라이언트를 얻고, 테이블별로 함수를 분리한다 (예: `insertMonitoringResult`, `insertErrorLog`). 에러는 `throw new Error(...)`로 상위에 전파.

## TypeScript

- 공유 타입(테이블 insert/row 타입 등)은 `@infra-support/shared`에서 가져온다. 직접 재정의하지 않는다.
- `noUnusedLocals`, `noUnusedParameters`, `strict`가 tsconfig에서 켜져 있으므로 사용하지 않는 변수/인자를 남기지 않는다.

## 코드 스타일

- 함수 상단에 목적을 설명하는 JSDoc(`@remarks`, `@throws`, `@author`)을 다는 기존 관례를 따른다. 기존 파일들을 참고해 톤을 맞춘다.
- `@/*` 경로 alias 사용 (tsconfig paths).

## 검증 커맨드

```bash
cd apps/monitor-server
pnpm build   # next build (타입체크 포함) — 신뢰 가능
pnpm lint    # next lint — 주의: 아래 참고
```

**주의**: 현재 이 앱에는 ESLint 설정 파일(`.eslintrc*`/`eslint.config.*`)이 없다. `pnpm lint`(`next lint`)를 실행하면 대화형 초기 설정 프롬프트가 뜨며 비대화형 환경(Claude Code 세션 포함)에서는 그대로 실패한다. 이는 기존부터 있던 미완성 설정이며 이번 작업 범위에서 임의로 고치지 않았다. 따라서 이 앱은 `pnpm build`만으로 검증하고, `pnpm lint`가 실패해도 이번 변경과 무관한 기존 이슈로 간주한다. ESLint 설정을 실제로 구성하려면 사용자에게 먼저 확인할 것.
