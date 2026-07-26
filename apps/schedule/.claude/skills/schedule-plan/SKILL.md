---
name: schedule-plan
description: apps/schedule(팀 일정 관리 툴) 관련 작업을 요청받았을 때, 구현을 시작하기 전에 반드시 이 스킬을 먼저 실행한다. apps/schedule/docs/의 기획안·기능설계서 원본을 확인하고, apps/schedule/docs/plan.md에 작업 항목을 todo 체크리스트로 기록한 뒤 진행 상황을 갱신한다. apps/schedule와 무관한 다른 앱(monitor-web, monitor-server) 작업에는 사용하지 않는다.
---

# schedule-plan

apps/schedule 작업 시 원본 스펙(기획안/기능설계서)을 먼저 확인하고, 작업 계획을 `apps/schedule/docs/plan.md`에 todo 체크리스트로 기록·갱신한다.

## 대상 판단

요청이 `apps/schedule/` 하위를 다루면 대상으로 본다. apps/schedule와 무관한 작업(다른 앱, 모노레포 공통 설정)이면 이 스킬을 사용하지 않는다.

## 절차

1. **시작 전**: 이번 요청과 관련된 범위를 `apps/schedule/docs/기획안.md`, `apps/schedule/docs/기능설계서.md`에서 먼저 확인한다.
   - 두 문서는 서로 다른 버전이다. 기능설계서.md가 더 나중에 작성된 확장 설계(캘린더, Slack 봇, 주간 리포트 등 포함)이므로 내용이 겹치면 기능설계서.md 쪽을 우선한다.
   - 두 문서에 없는 내용(예: 이미 뼈대 세팅 단계에서 확정한 "상태 커스터마이징 미채택", "Next.js 15/별도 Supabase 프로젝트/프론트엔드만 구성" 같은 결정)은 `apps/schedule/CLAUDE.md`를 함께 확인해 우선한다 — CLAUDE.md가 실제 채택된 최종 결정이고, docs/의 두 문서는 구현 전 원본 기획 스펙이다.
   - 디자인/색상은 더 이상 DESIGN.md(Linear 스타일 다크 테마) 기준이 아니다. schedule은 monitor-web과 동일하게 `packages/design-tokens`를 그대로 쓰기로 결정했다. 색상 토큰 목록은 `packages/design-tokens/dist/tailwind/preset.cjs`를 참고하고, 두 문서(기획안/기능설계서)에 남아있는 색상 관련 언급은 무시한다.

2. **plan.md 확인/생성**: `apps/schedule/docs/plan.md`를 읽는다.
   - 파일이 없으면 새로 만든다: `# apps/schedule 작업 계획` 제목 아래, 이번 요청의 작업 항목을 `- [ ] ...` 체크리스트로 정리해 작성한다.
   - 파일이 이미 있으면(제목만 있는 빈 파일 포함) 기존 내용을 그대로 두고, 이번 요청에 해당하는 새 작업 항목을 이어서 추가한다. 기존 완료(`- [x]`) 항목은 수정하지 않는다.
   - 작업 항목은 실제로 변경할 코드 단위로 구체적으로 쪼갠다 (예: "칸반 카드 드래그앤드롭 구현", "캘린더 가능 시간 등록 API 연결"). "기능 구현"처럼 뭉뚱그리지 않는다.

3. **작업 진행 중**: 항목을 하나 마칠 때마다 즉시 해당 줄을 `- [x]`로 갱신한다. 여러 항목을 몰아서 한 번에 갱신하지 않는다.

4. **응답을 마치기 전**: plan.md의 상태가 실제 완료 여부와 일치하는지 다시 확인하고 저장한다. 이번 요청 범위에서 착수하지 못한 항목은 `- [ ]`로 남겨 다음 세션이 이어갈 수 있게 한다.

## 주의

- plan.md는 문서일 뿐이다. 코드 변경 없이 plan.md만 갱신하고 끝내지 않는다.
- 이 스킬은 문서화 절차만 다룬다. 빌드/린트/타입체크 실행 여부는 루트 CLAUDE.md의 표준 작업 흐름을 따로 따른다 (응답을 마치기 전 사용자에게 확인).
- git add/commit 대상에 plan.md를 포함할지는 일반 커밋 규칙(이번 응답에서 Claude가 건드린 파일만 add)을 그대로 따른다.
- 이 스킬은 `apps/schedule/.claude/skills/`에 있어 apps/schedule 작업 맥락에서만 후보로 노출된다 (하드 스코프). 다른 앱 작업에는 나타나지 않는다.
