export const LOG_LIST_FILTERS = [
  { key: "all", label: "전체" },
  { key: "unchecked", label: "확인전" },
  { key: "checked", label: "확인완료" },
] as const;

export type LogListFilterKey = (typeof LOG_LIST_FILTERS)[number]["key"];

export const LOG_LIST_PAGE_SIZE = 10;

export const LOG_LIST_EMPTY_MESSAGE: Record<LogListFilterKey, string> = {
  all: "아직 에러 로그가 없어요",
  unchecked: "확인 전 에러 로그가 없어요",
  checked: "확인 완료한 에러 로그가 없어요",
};
