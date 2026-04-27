import type { ReactNode } from "react";
import type { UserRole } from "../../types";
import { useAuth } from "../../../hooks/useAuth";
import { LoginPage } from "../../pages/Login";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-300">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-red-600 dark:bg-gray-950 dark:text-red-300">
        You do not have permission to view this page.
      </div>
    );
  }

  return <>{children}</>;
}
