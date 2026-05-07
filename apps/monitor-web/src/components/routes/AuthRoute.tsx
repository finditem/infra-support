import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserQuery } from "@/queries/login/user.queries";
import { LoadingSpinner } from "@/components";

interface AuthRouteProps {
  requireAuth: boolean;
}

export const AuthRoute = ({ requireAuth }: AuthRouteProps) => {
  const location = useLocation();
  const { data: user, isLoading } = useUserQuery();

  if (isLoading) {
    return (
      <div className="h-full flex-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (!requireAuth && user) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
};
