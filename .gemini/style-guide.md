# Gemini Code Assist Style Guide

## Review Style

- Provide all review comments in **Korean (한글)**.
- Maintain a **helpful, supportive, and friendly** tone.
- **Do not use emojis** in any review comments.
- Be direct and specific.
- Explain what is wrong, why it matters, and how it can be improved.
- Do not praise unnecessarily.
- Do not make vague comments such as "consider improving this."
- **Do not leave code review comments on pull requests targeting `main` branch.**
- When reviewing, prioritize:
  1. Correctness
  2. Readability
  3. Maintainability
  4. Performance
  5. Consistency

## Tech Stack

### monitor-web (프론트엔드)
- **Framework:** Vite (SPA)
- **Language:** TypeScript
- **UI Library:** React 18
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS (with clsx, tailwind-merge)
- **Data Fetching:** TanStack Query (React Query) v5
- **Database Client:** Supabase JS
- **Charts:** Recharts
- **Date Utility:** date-fns

### monitor-server (서버 스크립트)
- **Runtime:** Node.js (tsx)
- **Language:** TypeScript
- **HTTP Client:** Axios
- **Database Client:** Supabase JS

### 모노레포 도구
- **Monorepo:** Turborepo + pnpm workspaces
- **Shared Types:** `packages/shared`

## Project Directory & Architecture

```
apps/
  monitor-web/     # 프론트엔드 SPA
  monitor-server/  # API 모니터링 서버 스크립트
packages/
  shared/          # 공통 타입 패키지
```

### monitor-web (`apps/monitor-web/src/`)
- **`components/common/`**: 재사용 가능한 공통 컴포넌트
- **`pages/{PageName}/`**: 페이지 단위 컴포넌트 (co-location 구조)
  - `hooks/`, `types/`, `utils/` — 해당 페이지 전용
- **`queries/{domain}/`**: TanStack Query 훅 (도메인별)
- **`queries/base/`**: 공통 쿼리 기반 설정
- **`hooks/`**: 전역 공통 커스텀 훅
- **`layouts/`**: 레이아웃 컴포넌트
- **`lib/`**: 외부 라이브러리 설정 및 초기화
- **`types/`**: 전역 공통 타입
- **`utils/`**: 전역 공통 유틸리티

## TypeScript

- Avoid `any`. Prefer `unknown` when types are unclear.
- Use shared cross-app types in `packages/shared/src/types.ts`.
- Use page-scoped types in `apps/monitor-web/src/pages/{PageName}/types/`.
- Use global types in `apps/monitor-web/src/types/`.

## React & Components

- **Prefer arrow functions** for components.
- Do **not** use `React.FC`. Use standard function generic or direct prop typing.
- Keep components focused on one responsibility.

## Data Fetching (TanStack Query)

- Do not use `useQuery` directly in components if a domain-specific wrapper exists.
- Define types in `pages/{PageName}/types/` (page-scoped) or `src/types/` (global).
- Implement query hooks in `src/queries/{domain}/`.
- Use base query utilities from `src/queries/base/`.
- Use consistent arrays for query keys (e.g., `["/domain", id]`).

## Imports

- Use **Absolute Imports** via `@/` alias (configured in Vite).
- Group imports: External Libraries → Internal (`@/`) → Relative/Assets

---

_This guide is subject to change as the project evolves._
