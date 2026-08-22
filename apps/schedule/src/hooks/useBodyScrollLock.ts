import { useEffect } from "react";

/** 현재 스크롤을 잠그고 있는 레이어 수. 모달 위에 모달이 겹쳐도 마지막 하나가 닫힐 때만 원래대로 되돌린다. */
let lockCount = 0;

/** 잠그기 직전의 body 인라인 스타일. 다른 곳에서 지정해 둔 값이 있으면 그대로 복원한다. */
let previousStyle = { overflow: "", paddingRight: "" };

/**
 * 모달이 떠 있는 동안 뒤 화면(body)이 스크롤되지 않게 막는다.
 * 스크롤바가 사라지면서 본문이 옆으로 밀리지 않도록 사라진 스크롤바 폭만큼 padding으로 채워 준다.
 * 스크롤바를 화면 위에 겹쳐 그리는 환경(macOS 기본값 등)에서는 폭이 0이라 padding을 건드리지 않는다.
 */
export const useBodyScrollLock = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    if (lockCount === 0) {
      const { overflow, paddingRight } = document.body.style;
      previousStyle = { overflow, paddingRight };

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount > 0) return;

      document.body.style.overflow = previousStyle.overflow;
      document.body.style.paddingRight = previousStyle.paddingRight;
    };
  }, [enabled]);
};
