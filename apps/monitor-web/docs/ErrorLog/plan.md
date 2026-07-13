# ErrorLog 작업 계획

## 페이지네이션 추가

- [x] ErrorLog 페이지 전용 Pagination 컴포넌트 작성 (`_components/Pagination.tsx`)
- [x] LogList에 페이지 상태(currentPage) 추가하고 mock 배열을 클라이언트 측에서 slice
- [x] LogList 하단에 Pagination 컴포넌트 연결
- [x] 상태 필터 변경 시 페이지를 1페이지로 초기화 — 필터 기능(아래 항목) 구현과 함께 처리
- [x] 페이지네이션 번호 버튼 모서리를 8px로 조정
- [x] 이전/다음 버튼을 화살표+텍스트 형태로 변경하고 첫/마지막 페이지에서 각각 비활성화
- [x] 이전/다음 버튼에 테두리(border-divider-default, 1px), radius 12px, 패딩(좌우 12px/상하 8px 기준) 적용
- [x] 이전/다음 버튼 텍스트를 16px/medium/lineHeight 24px(typo-body2-medium)로 적용
- [x] 이전/다음 버튼 크기를 64x40에 맞춰 패딩 값으로 조정
- [x] 화살표 아이콘 SVG 내부 여백으로 인한 아이콘-텍스트 간격 오차를 마이너스 마진으로 보정
- [x] mock 데이터를 21개로 확장해 페이지네이션 3페이지 노출 확인
- [x] 각 페이지의 마지막 로그 항목에서 하단 구분선 제거

## 필터 버튼 카운트 배지 라운디드 고정

- [x] LogListFilterButton의 카운트 Badge는 rounded-full을 유지하고, 한 자리 숫자일 때만 좌우 padding을 넓혀(px-[6px]) 정원에 가깝게, 두 자리 이상일 때는 좁혀(px-[4px]) 폭만 늘어나도록 조정
- [x] 카운트 Badge의 tabular-nums 제거 — 고정폭 숫자 렌더링이 두 자리 숫자(예: 21) 사이 간격을 부자연스럽게 벌려 보이는 문제 해결. padding이 이미 자릿수별 가변 처리되어 고정폭의 이점(레이아웃 흔들림 방지)이 불필요해짐

## 상태 필터 버튼 필터링 기능

- [x] `selectedFilter`를 고정 상수("all")에서 useState로 전환
- [x] `filteredItems` 계산 추가 — unchecked/checked는 `item.status` 기준으로 필터링, all은 전체 노출
- [x] 필터 버튼 onClick(no-op)을 `handleFilterChange`로 연결 — 필터 변경 시 currentPage를 1로 초기화

## 요약 카드(LogSummaryCards) mock 데이터 연동

- [x] `items` state를 LogList에서 ErrorLog로 상향 — LogList는 `items`/`onCheckedChange`를 props로 받도록 변경, LogSummaryCards와 동일 데이터 공유
- [x] `_utils/index.ts`에 `getLogSummaryData` 추가 — 전체 건수, 미확인 건수, 최근 발생 API명(occurredAt 최댓값 기준)을 mock items에서 계산
- [x] ErrorLog.tsx의 하드코딩된 `{ totalErrors: 0, ... }` 및 onRefresh no-op을 실제 계산값/mock 재설정으로 교체 — 체크 상태 토글 시 요약 카드도 즉시 갱신

## TSDoc 및 \_utils 구조 정리

- [x] `_utils/index.ts`(배럴)에 있던 `getLogSummaryData` 구현을 `_utils/ErrorLogUtils.ts`로 분리하고 index.ts는 re-export만 담당하도록 정리 — 페이지별 `_utils`에 분리 사례가 없어 전역 [utils/](../../src/utils)의 PascalCase+Utils suffix 네이밍(`ApiResponseTimeChartUtils.ts`)을 따름
- [x] `ErrorLogUtils.ts`의 `getLogSummaryData`에 TSDoc 작성 (`ApiResponseTimeChartUtils.ts` 스타일: 설명 → @remarks → @returns → @author junyeol)
- [x] `Pagination.tsx` TSDoc은 사용자 요청 범위 밖이라 제거 — TSDoc은 사용자가 지목한 파일에만 작성
