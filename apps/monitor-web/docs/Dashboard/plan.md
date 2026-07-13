# Dashboard 작업 계획

- [x] DashboardTimeToggle: 24일/7일 토글 상태별 UI 작업
- [x] DashboardSummaryCard: 사용 중인 아이콘 색상 수정
- [ ] DashboardResponseTimeChart: 마우스 이벤트로 확대/축소 시 표출되는 차트 수정
- [x] DashboardApiList: 상태 뱃지 디자인 수정
- [x] MOCK_RESPONSE_TIME_DATA: 7일치 raw 체크 데이터로 확장 (24h/7d 뷰가 동일 소스에서 필터링되도록)
- [x] ApiResponseTimeChartUtils: 7일 뷰용 일 단위 tick 생성 유틸 추가 (createThreeHourTicks에 대응)
- [x] DashboardResponseTimeChart/ApiResponseTimeChart: range를 24h 데이터 필터링 + period prop으로 연결해 토글이 실제 차트에 반영되도록 수정
- [x] DashboardResponseTimeChart: 장애 배지 문구를 range/outage 개수 기반 동적 텍스트로 변경
- [x] DashboardResponseTimeChart: 평균/최고/최저 응답속도 하드코딩 값을 목업 데이터 기준 계산으로 변경 (calculateResponseTimeStats)
