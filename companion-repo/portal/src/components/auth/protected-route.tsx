// src/components/auth/protected-route.tsx
import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve the intended destination for post-login redirect
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
