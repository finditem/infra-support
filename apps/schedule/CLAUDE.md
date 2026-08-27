# schedule

찾길 팀 내부 일정 관리 툴. Next.js App Router SPA(별도 백엔드 앱 없음), 모니터링 프로젝트와는 완전히 분리된 자체 Supabase 프로젝트를 사용한다.

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
- 인증 가드는 `src/middleware.ts`에서 처리한다. `NO_AUTH_REQUIRED_PATHS`(비로그인도 접근 가능)와 `GUEST_ONLY_PATHS`(로그인 시 `/`로 리다이렉트)를 분리해서 관리한다 — `/login`처럼 로그인 상태에서 접근하면 안 되는 경로는 두 배열 모두에, `/auth/confirm`처럼 로그인 여부와 무관하게 항상 접근 가능해야 하는 경로는 `NO_AUTH_REQUIRED_PATHS`에만 추가한다.
- 회원가입 화면은 두지 않는다 — 관리자가 Supabase 대시보드에서 계정을 생성하면 `handle_new_user` 트리거가 `profiles` 행을 자동으로 만든다.
- `src/middleware.ts`는 `auth.getUser()`로 검증한 유저 id를 `x-user-id` 요청 헤더에 실어 보낸다(클라이언트가 같은 헤더를 보내도 항상 여기서 set/delete로 덮어써 위조되지 않는다). 서버 컴포넌트에서 로그인한 유저 id만 필요하면 `auth.getUser()`를 다시 호출하지 말고 `next/headers`의 `headers().get("x-user-id")`로 재사용한다(예: `src/app/page.tsx`) — 왕복 네트워크 호출을 줄일 수 있다. 세션 자체를 검증해야 하는 민감한 경로라면 여전히 `auth.getUser()`를 직접 호출한다.

## 데이터/타입

- `packages/shared`를 참조하지 않는다. 그 패키지는 모니터링 프로젝트의 Supabase 스키마 전용이고, 이 앱은 완전히 별도 프로젝트/스키마이기 때문이다.
- 대신 `packages/shared`와 동일한 명명 패턴(`{Table}Row`/`{Table}Insert`/`{Table}Update`)을 `src/types/tables/`에 로컬로 둔다. 새 테이블을 추가하면 이 패턴을 따르고 `src/types/tables/index.ts`에 re-export를 추가한다.
- 작업 상태(`task_statuses`)는 6개 고정값(할 일/진행 중/검토 중/완료/지연됨/미완료)이며 커스터마이징 UI를 두지 않는다. `supabase/migrations/0001_init.sql`에서 seed로 삽입된다.

## 디자인 토큰

monitor-web과 동일하게 `packages/design-tokens`를 그대로 사용한다 (모노레포 전체가 같은 색상/타이포그래피를 쓰도록 통일). `tailwind.config.ts`는 `presets: [designTokensPreset]`만 지정하고 `theme.extend`는 비워둔다 — monitor-web의 `tailwind.config.ts`와 동일한 패턴이다. `globals.css` 최상단에서 `@import "@infra-support/design-tokens/css";`로 CSS 변수도 함께 불러온다.

주요 색상 토큰: `primary`/`primary-hover`(블루), `secondary`(퍼플), `surface`/`surface-elevated`(배경), `text-default`/`text-muted`/`text-inverse`(텍스트), `border`(보더), `success`/`warning`/`error`, `fg-state-error` 등. 전체 목록은 `packages/design-tokens/dist/tailwind/preset.cjs` 참고. 폰트는 `font-family-base: Pretendard, sans-serif` 토큰을 쓰지만 monitor-web과 마찬가지로 별도 폰트 파일 로드는 하지 않는다(시스템 폴백).

라이트/다크 모드를 지원한다. `packages/design-tokens`는 라이트 전용 단일 모드라 건드리지 않고, `apps/schedule` 앱 레벨에서 `tailwind.config.ts`(darkMode: "class")와 `globals.css`의 CSS 변수 오버라이드로 처리한다. DB에 저장된 상태(`task_statuses`) 색상처럼 인라인 style로 쓰는 값은 라이트/다크용 컬럼을 별도로 두고 헬퍼로 선택한다.

조건부로 갈리는 className은 템플릿 리터럴 대신 `src/utils`의 `cn()`을 사용한다.

```tsx
// bad
className={`text-xs ${isActive ? "text-primary" : "text-text-muted"}`}

// good
className={cn("text-xs", isActive ? "text-primary" : "text-text-muted")}
```

3단 이상 중첩되는 삼항연산자는 금지한다. 분기가 3개 이상이면 `if`를 순서대로 쌓은 별도 함수로 분리해 반환값을 계산한 뒤 JSX에서는 그 결과만 쓴다.

```tsx
// bad
const className = a ? "a" : b ? "b" : c ? "c" : "d";

// good
const getClassName = (a: boolean, b: boolean, c: boolean) => {
  if (a) return "a";
  if (b) return "b";
  if (c) return "c";
  return "d";
};
```

## 범위 (뼈대 세팅 기준)

칸반보드 CRUD, 드래그앤드롭, 캘린더 상호작용, Slack 연동, 실시간 동기화는 아직 구현되어 있지 않다. `/`와 `/calendar`는 인증 가드 확인용 최소 자리표시자다.

## 검증 커맨드

```bash
cd apps/schedule
pnpm build   # next build (타입체크 포함)
pnpm lint    # next lint
```

## 환경 변수

`.env.example` 참고. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 이 앱 전용 Supabase 프로젝트(모니터링 프로젝트와 별개)의 값을 사용한다. 일반 페이지/서버 액션은 로그인 세션이 항상 있으므로 여전히 anon key + RLS(`to authenticated`)로 접근한다.

Slack 웹훅(`src/app/api/slack/`)과 cron 라우트(`src/app/api/cron/`)는 예외다. Slack이나 Vercel Cron이 직접 호출하는 요청이라 로그인 세션이 없고, anon key로는 RLS를 통과하지 못한다. 이 라우트들에서만 `src/lib/supabase/service.ts`의 `createServiceClient()`(service role 키, RLS 우회)를 쓴다. service role 키는 절대 클라이언트 컴포넌트/번들에 import하지 않는다.

Slack 알림용 `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`, `SITE_URL`은 서버 전용 값이라 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. 서버 액션(`src/app/_lib/actions.ts`)에서만 읽으므로 클라이언트 번들에 포함되지 않는다. 세 값이 없으면 알림만 건너뛰고 일정 저장은 정상 동작한다.

봇 인바운드 연동(Slack 웹훅 수신, cron)에는 추가로 `SUPABASE_SERVICE_ROLE_KEY`(service role 클라이언트), `SLACK_SIGNING_SECRET`(Slack 요청 서명 검증), `OPENAI_API_KEY`(자연어 일정 등록 LLM 파싱, GPT-5 nano), `CRON_SECRET`(cron 엔드포인트 인증)이 필요하다. 모두 서버 전용이라 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.

자연어 일정 등록의 OpenAI 호출에는 별도 킬 스위치 `SLACK_AI_TASK_CREATION_ENABLED`가 있다. `OPENAI_API_KEY`가 설정돼 있어도 이 값이 정확히 `"true"`가 아니면 API를 호출하지 않고 "준비 중" 안내만 보낸다(기본값 비활성). 크레딧이 없거나 의도치 않은 토큰 소모를 막고 싶을 때 이 플래그만 끄면 된다.

## 기획 문서 및 작업 계획

`docs/기획안.md`, `docs/기능설계서.md`에 원본 스펙 문서가 저장되어 있다 (기능설계서.md가 더 나중에 작성된 확장 버전이라 내용이 겹치면 그쪽을 우선한다). apps/schedule 관련 작업을 시작하기 전에는 `schedule-plan` 스킬(`.claude/skills/schedule-plan/SKILL.md`)을 먼저 실행해 이 문서들을 확인하고 `docs/plan.md`에 작업 체크리스트를 기록한다.
