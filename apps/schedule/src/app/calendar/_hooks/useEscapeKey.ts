import { useEffect, useRef } from "react";

/**
 * ESC 키를 눌렀을 때 `onEscape`를 호출한다.
 * 모달이나 확인 팝업처럼 활성 상태일 때만 닫혀야 하는 UI는 `enabled`로 구독 여부를 제어한다.
 * 리스너는 document에 붙으므로 포커스가 어디에 있든 동작한다.
 */
export const useEscapeKey = (onEscape: () => void, enabled = true) => {
  const savedHandler = useRef(onEscape);

  useEffect(() => {
    savedHandler.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") savedHandler.current();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
};
