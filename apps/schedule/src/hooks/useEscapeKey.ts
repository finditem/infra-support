import { useEffect, useRef } from "react";

/**
 * ESC 키를 눌렀을 때 `onEscape`를 호출한다.
 * 모달이나 확인 팝업처럼 활성 상태일 때만 닫혀야 하는 UI는 `enabled`로 구독 여부를 제어한다.
 * 리스너는 document에 붙으므로 포커스가 어디에 있든 동작한다.
 * 다만 모달 안의 팝오버처럼 더 안쪽 레이어가 먼저 ESC를 처리했다면 넘긴다. 안쪽 레이어는
 * window 캡처 단계에서 키를 가로채 `preventDefault`로 처리 사실을 남기는데(`MentionPicker`),
 * 그 이벤트가 document까지 올라오는 것은 막지 못해 여기서 걸러 주지 않으면 모달까지 함께 닫힌다.
 */
export const useEscapeKey = (onEscape: () => void, enabled = true) => {
  const savedHandler = useRef(onEscape);

  useEffect(() => {
    savedHandler.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) savedHandler.current();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
};
