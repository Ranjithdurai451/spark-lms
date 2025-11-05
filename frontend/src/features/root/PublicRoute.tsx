import { useAppSelector } from "@/lib/hook";
import { Navigate } from "react-router";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const user = useAppSelector((state) => state.auth.user);

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/in" replace />;
  }

  // Otherwise, show the public route (e.g. login/register)
  return children;
};

export default PublicRoute;
