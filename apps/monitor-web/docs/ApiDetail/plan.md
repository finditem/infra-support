# ApiDetail 작업 계획

## 완료된 작업

- [x] `/api/:apiId` 라우팅 추가 및 페이지 폴더 구조 생성
- [x] API 상세 페이지 UI 기초 퍼블리싱
- [x] 책임별 컴포넌트 분리 (DetailHeader, DetailSummaryCards, DetailResponseChart, DetailCheckLogs, DetailImpactedFeatures, DetailSettings, DetailIncidentHistory)
- [x] DetailHeader 리팩토링 및 접근성, 시맨틱 태그 개선
- [x] DetailSummaryCards 리팩토링 및 접근성, 시맨틱 태그 개선
- [x] DetailCheckLogs 리팩토링 및 접근성, 시맨틱 태그 개선
- [x] DetailImpactedFeatures 리팩토링 및 접근성, 시맨틱 태그 개선
- [x] DetailSettings 리팩토링 및 접근성, 시맨틱 태그 개선, 중복 스타일 제거
- [x] 목업 데이터를 `src/mock/apiDetail.ts`로 분리
- [x] `ApiStatus` 타입을 전역 `src/types`로 분리
- [x] 타이포 스타일 및 디자인 수정 반영

## 남은 작업

### 데이터 연동 (Supabase 실데이터 전환)

- [ ] `src/queries/apiDetail/apiDetail.queries.ts` 신설 — `useAppQuery` 래퍼와 `apisQueryKeys.detail(apiId)` 사용
- [ ] ApiDetail.tsx에서 `useParams`의 `apiId`를 쿼리 파라미터로 사용하고 임시 `console.warn(apiId)` 제거
- [ ] DetailHeader의 `MOCK_HEADER_DATA` 실데이터 전환 (이름, 상태 코드, 로고 이미지)
- [ ] DetailHeader의 하드코딩된 설명 문구, 카테고리(`map`), 출처 링크(Kakao developers)를 API 데이터 기반으로 변경
- [ ] DetailHeader 로고 이미지 경로를 `/src/assets/mocks/api-detail-mock.png` 대신 실제 에셋 또는 API 응답 값으로 교체 (현재 경로는 프로덕션 빌드에서 깨짐)
- [ ] DetailSummaryCards의 하드코딩된 `SUMMARY_CARD_DATA`(상태, 마지막 체크 시간, 응답 속도, 성공률) 실데이터 전환
- [ ] DetailCheckLogs의 `MOCK_LOGS` 실데이터 전환
- [ ] DetailCheckLogs의 하드코딩된 범례 카운트(`LEGEND_ITEMS`), 체크 주기 배지("3시간 주기"), 조회 구간("오늘 00:00 - 24:00") 실데이터 전환
- [ ] DetailImpactedFeatures의 `MOCK_FEATURES` 실데이터 전환
- [ ] DetailSettings의 `MOCK_SETTINGS` 실데이터 전환 및 HTTP Method 하드코딩("GET") 제거
- [ ] DetailIncidentHistory의 `MOCK_ERROR_LOG_ITEMS` 실데이터 전환 및 "최근 7일" 기준 필터 적용

### 미구현 기능

- [x] DetailResponseChart 구현 — 현재 회색 placeholder div만 존재하므로 `src/components/charts`의 Recharts 기반 차트로 응답 시간 추이 렌더링
- [ ] DetailHeader "수동요청" 버튼에 수동 체크 실행 mutation 연결 (현재 onClick 없음)
- [x] DetailHeader "수정" 버튼에 `/api/:apiId/edit` 이동 연결 (현재 onClick 없음)
- [x] DetailSettings "설정수정" 버튼에 `/api/:apiId/edit` 이동 연결 (현재 onClick 없음)
- [x] DetailIncidentHistory 확인 처리 버튼을 로컬 state 변경 대신 실제 mutation으로 연결

### 버그 수정

- [ ] DetailIncidentHistory "전체보기" 버튼의 `navigate("/api-detail")`을 실제 라우트 `/errors`로 수정 (현재 존재하지 않는 경로라 NotFound로 이동)
- [ ] DetailIncidentHistory "더보기" 버튼의 `navigate("/error-log")`를 실제 라우트 `/api/:apiId/errors/:errorId`로 수정 (현재 존재하지 않는 경로라 NotFound로 이동)

### 상태 처리 및 정리

- [ ] 각 섹션의 로딩 상태 처리 (스켈레톤 또는 로딩 UI)
- [ ] 데이터 조회 실패 시 에러 상태 처리 및 토스트 연결
- [ ] DetailIncidentHistory의 `TODO(지권)` 해소 — BasicButton `as` prop 패턴 적용
- [x] DetailSettings의 `TODO(지권)` 해소 — 버튼 outline 스타일 변경
- [ ] 데이터 가공 로직이 생기면 비어 있는 `_hooks`, `_utils`로 분리
