---
name: handle-pr-review
description: PR에 남겨진 Gemini 코드 리뷰에 대응하거나, 리뷰 코멘트를 반영한 뒤 후속 처리를 할 때 이 스킬을 실행한다. PR 생성 자체(create-pr)나 코드 자체에 대한 리뷰 수행(code-review)에는 사용하지 않는다.
---

# handle-pr-review

Gemini 코드 리뷰에 대한 팀의 대응 컨벤션을 그대로 따른다: 리액션으로 처리 방침을 표시하고, 반영 여부에 따라 코멘트 위치를 구분하며, 라벨과 체크리스트를 갱신한다. GitHub UI 전용 동작(스레드 resolve, 리뷰 재요청)은 사람이 직접 수행하도록 안내만 한다.

## 절차

1. Gemini 리뷰 코멘트마다 처리 방침을 리액션으로 표시한다.
   - 수정할 사항: `gh api repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions -f content='+1'` (또는 `laugh`)
   - 확인이 필요한 사항: `gh api repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions -f content='eyes'`
   - 수정하지 않아도 되는 사항: `gh api repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions -f content='-1'`로 표시하고, 사유를 코멘트로 남긴다 (아래 2번의 개별 코멘트 방식 사용).
2. 리뷰를 반영해 코드를 수정한 경우.
   - Gemini 리뷰 스레드에 답글로 남기지 않고 일반 PR 코멘트로 작성한다: `gh pr comment {pr} --body "..."`.
   - 개별 코멘트가 필요한 예외적인 경우에만 Gemini 리뷰 스레드에 답글을 남긴다: `gh api repos/{owner}/{repo}/pulls/{pr}/comments -f body="..." -F in_reply_to={comment_id}`.
   - 스레드 resolve 버튼은 GitHub UI 전용 동작이므로 API로 대신 누르지 않는다. 모든 리뷰어가 확인한 뒤 사람이 직접 resolve해야 한다는 점을 안내한다.
3. 리뷰 코멘트를 실제로 반영했을 때, 리뷰 재요청("되돌리기") 버튼도 GitHub UI 전용 동작이므로 대신 누르지 않는다. 반영이 끝났음을 알리고, 사람이 직접 버튼을 눌러 재요청 알림을 보내야 한다는 점을 안내한다.
4. PR에 `D-*` 라벨을 필수로 추가한다: `gh pr edit {pr} --add-label "D-N"`. N(기한 일수)은 스킬에 고정하지 않고 매번 대화로 확인한다. 해당 기간 내에 리뷰가 되지 않으면 PR을 머지한다는 팀 규칙을 참고한다.
5. PR 본문의 체크리스트 항목을 반영이 끝난 만큼 체크한다: 기존 본문을 읽고 `- [ ]`를 `- [x]`로 치환한 전체 본문을 `gh pr edit {pr} --body "..."`로 전달한다.

## 주의

- 리액션/코멘트/라벨/체크리스트 갱신은 Claude가 직접 실행하지만, 스레드 resolve와 리뷰 재요청은 GitHub UI 전용 동작이라 자동화하지 않는다.
- 코멘트 본문은 이모티콘 없이 온전한 문장으로 작성한다 (루트 CLAUDE.md 텍스트 작성 원칙).
- `gh pr edit`으로 라벨을 추가하거나 본문을 변경하는 것은 원격 PR 상태에 영향을 주는 작업이므로, 사용자가 이 스킬 실행을 명시적으로 요청했을 때만 진행한다.
