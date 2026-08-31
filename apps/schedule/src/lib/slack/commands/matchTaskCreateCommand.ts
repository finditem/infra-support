const TRIGGER = "일정추가";

/**
 * 5-1: "일정추가 [제목] [담당자(선택)] [날짜(선택)]" 트리거를 감지한다.
 * 트리거가 없으면 null(자연어 등록으로 폴백), 있으면 트리거 이후 나머지 텍스트를 반환한다.
 */
export const matchTaskCreateCommand = (text: string): string | null => {
  if (text === TRIGGER) return "";
  if (!text.startsWith(`${TRIGGER} `)) return null;

  return text.slice(TRIGGER.length).trim();
};
