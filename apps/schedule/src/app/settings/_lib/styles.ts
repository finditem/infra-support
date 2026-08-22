/**
 * 설정 하위 페이지에서 공유하는 클래스 모음.
 *
 * 스프린트와 팀 관리는 탭으로 오가는 같은 화면이라 폼과 목록 행이 같은 형태여야 하는데,
 * 두 페이지가 각각 만들어지면서 여백과 모서리 값이 어긋나 있었다. 기준은 스프린트 쪽이다.
 */

/** 폼과 인라인 수정에 쓰는 한 줄 입력. */
export const settingsInputClassName =
  "rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-default outline-none transition focus:border-primary";

/**
 * 폼의 제출 버튼. 스프린트는 정사각형 아이콘 버튼, 팀 관리는 글자 버튼이라
 * 크기와 안쪽 정렬은 사용처에서 덧붙인다.
 */
export const settingsFormButtonClassName =
  "shrink-0 rounded-lg border border-border bg-surface-elevated text-text-muted transition hover:bg-fill-neutural-subtle-hover disabled:opacity-50";

/** 목록의 항목 한 줄. */
export const settingsRowClassName =
  "rounded-lg border border-border bg-surface-elevated px-4 py-2.5";

/** 행 오른쪽의 아이콘 버튼(수정, 삭제). */
export const settingsIconButtonClassName =
  "flex size-6 items-center justify-center rounded-md text-text-muted hover:bg-fill-neutural-subtle-hover";

/** 행 안에서 쓰는 글자 버튼(저장, 삭제, 취소). 색상은 사용처에서 덧붙인다. */
export const settingsTextButtonClassName =
  "rounded-md px-2 py-1 text-xs font-medium hover:bg-fill-neutural-subtle-hover";
