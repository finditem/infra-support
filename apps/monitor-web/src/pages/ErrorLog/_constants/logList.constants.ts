export const LOG_LIST_FILTERS = [
  { key: "all", label: "전체" },
  { key: "unchecked", label: "확인전" },
  { key: "checked", label: "확인완료" },
] as const;

export type LogListFilterKey = (typeof LOG_LIST_FILTERS)[number]["key"];
