# shared

`monitor-web`/`monitor-server` 간 공유하는 TypeScript 타입 전용 패키지. 런타임 코드 없음, 빌드 산출물(`dist/`)은 `tsc`로 생성.

## 디렉토리 구조

```
src/
  types/
    tables/{table}.ts   # Supabase 테이블별 타입 정의
    tables/index.ts      # 테이블 타입 re-export
    index.ts              # tables re-export
  index.ts                 # types re-export (패키지 진입점)
```

## 타입 정의 패턴

새 Supabase 테이블 타입을 추가할 때는 `src/types/tables/{table}.ts`에 아래 3종 세트로 정의한다 (예: [src/types/tables/apis.ts](src/types/tables/apis.ts)):

- `{Table}Row` — DB에서 읽어올 때의 전체 row 타입 (nullable 컬럼은 `T | null`, id 포함)
- `{Table}Insert` — insert 시 타입. nullable/기본값 있는 컬럼은 `Omit` 후 optional로 재선언
- `{Table}Update` — `Partial<{Table}Writable>`

정의 후 `src/types/tables/index.ts`에 `export * from "./{table}"`을 추가한다. re-export 체인(`tables/index.ts` → `types/index.ts` → `src/index.ts`)을 그대로 유지한다.

## 검증 커맨드

```bash
cd packages/shared
pnpm build   # tsc — 신뢰 가능
```

이 패키지를 수정했다면 빌드가 통과해야 하고, 이 패키지에 의존하는 monitor-web/monitor-server도 함께 빌드해 타입 불일치가 없는지 확인한다.

**주의**: `pnpm lint`(`eslint src --ext ts`)가 정의는 되어 있지만 ESLint 설정 파일이 없어 즉시 실패한다. 기존부터 있던 미완성 설정이므로 이번 작업 범위에서 고치지 않았다. `pnpm build`만으로 검증하고, `pnpm lint` 실패는 무시한다.
