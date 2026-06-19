import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserQuery } from "@/queries/login/user.queries";
import { LoadingSpinner } from "@/components";

/**
 * 인증 여부에 따라 페이지 접근을 제어하고 리다이렉트를 처리하는 라우트 컴포넌트입니다.
 *
 * @remarks
 * - 비로그인 사용자가 `requireAuth={true}` 라우트에 접근 시 `/login`으로 리다이렉트되며, 원래 접속하려던 경로를 `state.from`에 저장합니다.
 * - 로그인한 사용자가 `requireAuth={false}` 라우트에 접근 시 메인(`/`)으로 리다이렉트됩니다.
 *
 * @author jikwon
 */

interface AuthRouteProps {
  /**
   * 인증 필요 여부
   * `true`: 로그인한 사용자만 접근 가능
   * `false`: 비로그인 사용자만 접근 가능
   */
  requireAuth: boolean;
}

/**
 * @example
 * ```tsx
 * // 로그인한 사용자만 접근 가능한 라우트 설정
 * <Route element={<AuthRoute requireAuth={true} />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 * ```
 */

const AuthRoute = ({ requireAuth }: AuthRouteProps) => {
  const location = useLocation();
  const { data: user, isLoading } = useUserQuery();

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-[#F7F7F7] flex-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <Navigate replace state={{ from: `${location.pathname}${location.search}` }} to="/login" />
    );
  }

  if (!requireAuth && user) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
};

export default AuthRoute;
