# monitor-web

외부 API 모니터링 데이터 시각화 대시보드. Vite SPA.

## 기술 스택

- **Framework**: Vite + React 18, TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS (`clsx`, `tailwind-merge`로 클래스 병합, `@/utils/cn`)
- **Data Fetching**: TanStack Query v5
- **DB Client**: Supabase JS
- **Charts**: Recharts
- **Date**: date-fns

## 디렉토리 구조

```
src/
  components/
    common/           # 재사용 공통 컴포넌트: buttons, display, feedback, inputs, modals, routes
    charts/           # 차트 컴포넌트 (Recharts 기반)
  pages/{PageName}/    # 페이지 단위 co-location 구조
    {PageName}.tsx
    _components/       # 해당 페이지 전용 컴포넌트
    _hooks/             # 해당 페이지 전용 훅
    _types/             # 해당 페이지 전용 타입
    _utils/             # 해당 페이지 전용 유틸
    index.ts            # re-export
  queries/
    base/               # useAppQuery, useAppMutation (공통 래퍼)
    {domain}/           # 도메인별 쿼리 훅 (login, mock 등)
    queryKeys.ts         # 도메인별 query key factory
  hooks/                # 전역 공통 커스텀 훅 (useToast 등)
  layouts/              # Sidebar, ToastContainer 등
  lib/                  # 외부 라이브러리 초기화 (supabase, queryClient)
  types/                # 전역 공통 타입
  utils/                # 전역 공통 유틸 (cn 등)
```

새 페이지를 추가할 때는 위 co-location 구조(`_components`/`_hooks`/`_types`/`_utils` + `index.ts`)를 그대로 따른다. 예: [pages/Dashboard/](src/pages/Dashboard), [pages/ApiDetail/](src/pages/ApiDetail).

`_types`/`_utils`의 `index.ts`는 re-export 전용 배럴 파일이다. 구현은 반드시 별도 파일에 작성한다. 새 유틸 파일을 만들 때는 같은 `_utils` 폴더 안에 참고할 기존 분리 사례가 없으면, 전역 [utils/](src/utils)의 네이밍(PascalCase + `Utils` suffix, 예: `ApiResponseTimeChartUtils.ts`)을 따른다.

## TypeScript

- `any` 금지. 타입이 불확실하면 `unknown` 사용.
- 앱 간 공유 타입은 `@infra-support/shared`에서 가져온다.
- 페이지 전용 타입은 `pages/{PageName}/_types/`, 전역 공통 타입은 `src/types/`.

## React 컴포넌트

- 컴포넌트는 화살표 함수로 작성.
- `React.FC` 사용하지 않음 — 함수 제네릭 또는 props를 직접 타이핑.
- 컴포넌트는 하나의 책임에 집중.

## TSDoc

- TSDoc은 먼저 작성해도 되는지 사용자에게 물어보고, 사용자가 지목한 파일/함수에 대해서만 작성한다. 요청받지 않은 인접 파일로 임의로 확장하지 않는다.
- 작성할 때는 반드시 근처의 기존 TSDoc(예: [ApiResponseTimeChartUtils.ts](src/utils/ApiResponseTimeChartUtils.ts), [Badge.tsx](src/components/common/display/Badge.tsx))을 먼저 확인하고, 설명 → `@remarks`(선택) → `@example`(선택) → `@returns`(선택) → `@author junyeol` 순서와 줄바꿈 구조를 그대로 따른다.

## 데이터 페칭 (TanStack Query)

컴포넌트에서 `useQuery`/`useMutation`을 직접 호출하지 않는다. 항상 아래 계층을 따른다:

1. `src/queries/base/useAppQuery.ts`, `useAppMutation.ts` — 프로젝트 공통 래퍼. 새 쿼리도 이 래퍼를 사용해 구현한다.
2. `src/queries/queryKeys.ts` — 도메인별 key factory (`{domain}QueryKeys.all` → `.list()`/`.detail(id)` 계층 확장). 새 도메인 추가 시 이 파일에 factory를 추가한다. 예시: [queryKeys.ts](src/queries/queryKeys.ts)
3. `src/queries/{domain}/{domain}.queries.ts` — 실제 훅 구현. Supabase 호출 → `useAppQuery`/`useAppMutation`으로 감싸는 패턴. 예시: [queries/login/login.queries.ts](src/queries/login/login.queries.ts)

## Import

- `@/` 절대경로 사용 (Vite alias).
- 그룹 순서: 외부 라이브러리 → 내부(`@/`) → 상대/에셋.

## 코드 스타일

- eslint `perfectionist/sort-jsx-props`가 JSX prop 순서를 자동 강제한다 (key/ref → id → accessibility → className/style → 나머지 → on\* 콜백). 수동으로 신경 쓸 필요 없이 `pnpm lint`가 잡아준다.
- 커밋 시 husky pre-commit이 `lint-staged`(prettier + eslint --fix)를 자동 실행한다.

## 검증 커맨드

```bash
cd apps/monitor-web
pnpm build   # tsc --noEmit + vite build
pnpm lint    # eslint src --ext ts,tsx
```

이 앱의 파일을 수정했다면 위 두 명령이 모두 통과해야 한다.

## 페이지 작업 계획 문서화

특정 페이지(`src/pages/{PageName}/`) 관련 작업을 요청받으면, 구현을 시작하기 전에 `plan-page` 스킬을 실행해 `docs/{PageName}/plan.md`를 확인/갱신한다.
