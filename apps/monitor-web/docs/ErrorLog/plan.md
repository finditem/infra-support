# ErrorLog 작업 계획

## 페이지네이션 추가

- [x] ErrorLog 페이지 전용 Pagination 컴포넌트 작성 (`_components/Pagination.tsx`)
- [x] LogList에 페이지 상태(currentPage) 추가하고 mock 배열을 클라이언트 측에서 slice
- [x] LogList 하단에 Pagination 컴포넌트 연결
- [ ] 상태 필터 변경 시 페이지를 1페이지로 초기화 — 보류: 상태 필터 버튼(`LogListFilterButton`)의 onClick이 현재 no-op(`() => {}`)라 필터 선택 로직 자체가 아직 없음. 필터 기능이 먼저 구현되어야 착수 가능
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
