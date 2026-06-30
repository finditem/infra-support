import { useEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";

/**
 * 라우트 변경 시 지정한 스크롤 컨테이너의 위치를 최상단으로 초기화하는 컴포넌트입니다.
 *
 * @remarks
 * - `window`가 아니라 `targetRef`로 전달된 스크롤 컨테이너를 직접 제어합니다.
 * - `pathname` 변경 시 `top`, `left` 위치를 0으로 되돌립니다.
 * - 화면에 렌더링되는 UI 없이 라우팅 사이드 이펙트만 처리합니다.
 *
 * @author junyeol
 */

interface ScrollToTopProps {
  targetRef: RefObject<HTMLElement | null>;
}

const ScrollToTop = ({ targetRef }: ScrollToTopProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    targetRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname, targetRef]);

  return null;
};

export default ScrollToTop;
