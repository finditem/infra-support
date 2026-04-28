import { Component, ErrorInfo, ReactNode } from "react";

/** ErrorBoundary 컴포넌트의 Props */
interface ErrorBoundaryProps {
  /** 보호할 하위 컴포넌트 트리입니다. */
  children: ReactNode;
  /** 에러 발생 시 표시할 대체 UI입니다.
   * ReactNode 또는 error와 reset function을 인자로 받아 ReactNode를 반환하는 함수 형태로 지정할 수 있습니다.
   * 미지정 시 아무것도 렌더링하지 않습니다.
   */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** 에러 발생 시 호출되는 콜백 함수입니다.
   * 로깅/모니터링 연동에 사용합니다.
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/** ErrorBoundary 컴포넌트의 State */
interface ErrorBoundaryState {
  /** 현재 포착된 에러 객체입니다.
   * `null`이면 정상 렌더링 상태입니다.
   */
  error: Error | null;
}

/**
 * 하위 컴포넌트 트리에서 발생한 렌더링 에러를 포착하고 Fallback UI를 제공하는 공통 Error Boundary 컴포넌트입니다.
 *
 * @remarks
 * - 렌더링/라이프사이클 단계의 에러를 포착합니다.
 * - 이벤트 핸들러 내부 에러와 비동기 콜백 에러는 포착하지 않습니다.
 * - `fallback` 미지정 시 에러 발생 화면은 렌더링하지 않습니다.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *  fallback={(error, reset) => (
 *    <div>
 *      <p>문제가 발생했습니다.</p>
 *      <button onClick={reset}>다시 시도</button>
 *    </div>
 *  )}
 *  onError={(error, errorInfo) => {
 *    console.error("ErrorBoundary caught:", error, errorInfo);
 *  }}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @author junyeol
 */

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  /** 에러 발생 시 다음 렌더링에서 Fallback UI를 보이도록 상태를 업데이트합니다.*/
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  /** 에러 정보 기록, 모니터링 서버 전송 등 사이드 이펙트 처리에 활용합니다. */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  /** Fallback 렌더 함수에서 `reset`으로 전달되어 "다시 시도" 버튼 등에 사용됩니다. */
  reset = () => {
    this.setState({ error: null });
  };

  /** 클래스 컴포넌트가 화면에 무엇을 그릴지 결정하는 메서드입니다. */
  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback !== undefined) {
        return typeof fallback === "function" ? fallback(error, this.reset) : fallback;
      }
      return null;
    }

    return children;
  }
}

export default ErrorBoundary;
