# schedule

찾아줘! 팀 내부 일정 관리 툴. Next.js App Router SPA(별도 백엔드 앱 없음), 모니터링 프로젝트와는 완전히 분리된 자체 Supabase 프로젝트를 사용한다.

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS — `packages/design-tokens`(monitor-web과 공유하는 디자인 토큰 패키지) 사용 (아래 "디자인 토큰" 참고)
- **Auth/DB Client**: Supabase (`@supabase/ssr` + `@supabase/supabase-js`)

## 디렉토리 구조

```
src/
  app/
    layout.tsx          # 전역 레이아웃
    page.tsx             # 메인(칸반보드) — 인증 필요
    calendar/page.tsx     # 캘린더 — 인증 필요
    login/page.tsx         # 로그인 (공개)
    globals.css            # design-tokens CSS 변수 import + tailwind directives
  components/            # 전역 공통 컴포넌트
  lib/supabase/
    client.ts             # 브라우저 클라이언트
    server.ts              # 서버 컴포넌트/라우트 핸들러용 클라이언트
  middleware.ts            # 세션 갱신 + 인증 가드 (미들웨어는 src/ 루트에 위치)
  types/tables/{table}.ts  # Supabase 테이블별 Row/Insert/Update 타입
supabase/
  migrations/*.sql         # Supabase 프로젝트에 직접 적용할 마이그레이션 (SQL 에디터 또는 supabase db push)
```

## 인증

`@supabase/ssr` 기반 Next.js 표준 패턴을 쓴다 (monitor-web의 커스텀 쿠키 어댑터와 다름 — SSR 환경이라 별도 패턴 필요).

- 서버 컴포넌트/라우트 핸들러에서는 항상 `src/lib/supabase/server.ts`의 `createClient()`를 사용한다.
- 클라이언트 컴포넌트에서는 `src/lib/supabase/client.ts`의 `createClient()`를 사용한다.
- 인증 가드는 `src/middleware.ts`에서 처리한다. `/login`을 제외한 모든 경로는 비로그인 시 `/login`으로 리다이렉트된다. 새 공개 경로가 필요하면 `middleware.ts`의 `PUBLIC_PATHS`에 추가한다.
- 회원가입 화면은 두지 않는다 — 관리자가 Supabase 대시보드에서 계정을 생성하면 `handle_new_user` 트리거가 `profiles` 행을 자동으로 만든다.

## 데이터/타입

- `packages/shared`를 참조하지 않는다. 그 패키지는 모니터링 프로젝트의 Supabase 스키마 전용이고, 이 앱은 완전히 별도 프로젝트/스키마이기 때문이다.
- 대신 `packages/shared`와 동일한 명명 패턴(`{Table}Row`/`{Table}Insert`/`{Table}Update`)을 `src/types/tables/`에 로컬로 둔다. 새 테이블을 추가하면 이 패턴을 따르고 `src/types/tables/index.ts`에 re-export를 추가한다.
- 작업 상태(`task_statuses`)는 6개 고정값(할 일/진행 중/검토 중/완료/지연됨/미완료)이며 커스터마이징 UI를 두지 않는다. `supabase/migrations/0001_init.sql`에서 seed로 삽입된다.

## 디자인 토큰

monitor-web과 동일하게 `packages/design-tokens`를 그대로 사용한다 (모노레포 전체가 같은 색상/타이포그래피를 쓰도록 통일). `tailwind.config.ts`는 `presets: [designTokensPreset]`만 지정하고 `theme.extend`는 비워둔다 — monitor-web의 `tailwind.config.ts`와 동일한 패턴이다. `globals.css` 최상단에서 `@import "@infra-support/design-tokens/css";`로 CSS 변수도 함께 불러온다.

주요 색상 토큰: `primary`/`primary-hover`(블루), `secondary`(퍼플), `surface`/`surface-elevated`(배경), `text-default`/`text-muted`/`text-inverse`(텍스트), `border`(보더), `success`/`warning`/`error`, `fg-state-error` 등. 전체 목록은 `packages/design-tokens/dist/tailwind/preset.cjs` 참고. 폰트는 `font-family-base: Pretendard, sans-serif` 토큰을 쓰지만 monitor-web과 마찬가지로 별도 폰트 파일 로드는 하지 않는다(시스템 폴백).

앱 전용 다크 테마(DESIGN.md 기반)는 채택하지 않기로 했다 — 모노레포 전체 색상 일관성을 우선했다.

## 범위 (뼈대 세팅 기준)

칸반보드 CRUD, 드래그앤드롭, 캘린더 상호작용, Slack 연동, 실시간 동기화는 아직 구현되어 있지 않다. `/`와 `/calendar`는 인증 가드 확인용 최소 자리표시자다.

## 검증 커맨드

```bash
cd apps/schedule
pnpm build   # next build (타입체크 포함)
pnpm lint    # next lint
```

## 환경 변수

`.env.example` 참고. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 이 앱 전용 Supabase 프로젝트(모니터링 프로젝트와 별개)의 값을 사용한다. 서버 전용 키(service role)는 쓰지 않는다 — 별도 백엔드 앱이 없고 클라이언트에서 anon key + RLS로 접근하는 구조이기 때문이다.

## 기획 문서 및 작업 계획

`docs/기획안.md`, `docs/기능설계서.md`에 원본 스펙 문서가 저장되어 있다 (기능설계서.md가 더 나중에 작성된 확장 버전이라 내용이 겹치면 그쪽을 우선한다). apps/schedule 관련 작업을 시작하기 전에는 `schedule-plan` 스킬(`.claude/skills/schedule-plan/SKILL.md`)을 먼저 실행해 이 문서들을 확인하고 `docs/plan.md`에 작업 체크리스트를 기록한다.
