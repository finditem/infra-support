import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * 지정한 요소들 바깥을 눌렀을 때 팝오버를 닫는다.
 * refs 배열과 onClose는 렌더마다 새로 만들어지는 경우가 많아서, 매번 리스너를
 * 다시 붙이지 않도록 최신 값을 ref에 담아두고 isOpen이 바뀔 때만 구독을 갱신한다.
 */
export const useOutsideClose = (
  isOpen: boolean,
  refs: RefObject<HTMLElement>[],
  onClose: () => void
) => {
  const latestRef = useRef({ refs, onClose });
  latestRef.current = { refs, onClose };

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInside = latestRef.current.refs.some((ref) => ref.current?.contains(target));
      if (!isInside) latestRef.current.onClose();
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);
};
