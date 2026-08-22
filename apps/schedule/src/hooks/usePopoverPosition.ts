import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";

/** 트리거와 패널 사이 간격(px). */
const GAP = 4;

interface UsePopoverPositionOptions {
  isOpen: boolean;
  /** 팝오버의 기준이 되는 요소(트리거 버튼, 입력 필드 등). */
  anchorRef: RefObject<HTMLElement>;
  /** 실제로 띄우는 패널. 높이/너비를 재서 화면 밖으로 나가지 않게 보정한다. */
  panelRef: RefObject<HTMLElement>;
  align?: "left" | "center";
}

/**
 * 부모의 overflow-hidden에 잘리지 않도록 body에 Portal로 띄우는 팝오버의
 * 화면 좌표를 계산한다. 아래쪽 공간이 부족하면 기준 요소 위쪽으로 뒤집고,
 * 좌우로는 화면 안에 들어오도록 clamp한다.
 */
export const usePopoverPosition = ({
  isOpen,
  anchorRef,
  panelRef,
  align = "left",
}: UsePopoverPositionOptions) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight ?? 0;
    const panelWidth = panelRef.current?.offsetWidth ?? 0;
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const showAbove = panelHeight > 0 && spaceBelow < panelHeight + GAP;
    const left =
      align === "center"
        ? anchorRect.left + anchorRect.width / 2 - panelWidth / 2
        : anchorRect.left;
    const clampedLeft = Math.min(Math.max(GAP, left), window.innerWidth - panelWidth - GAP);

    setPosition({
      top: showAbove ? anchorRect.top - panelHeight - GAP : anchorRect.bottom + GAP,
      left: clampedLeft,
    });
  }, [isOpen, align, anchorRef, panelRef]);

  return position;
};
