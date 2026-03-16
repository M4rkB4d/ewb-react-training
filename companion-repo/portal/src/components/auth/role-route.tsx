// src/components/auth/role-route.tsx
import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';
import { hasMinimumRole } from '@/lib/permissions';
import type { Role } from '@/types/auth';

interface RoleRouteProps {
  requiredRole: Role;
  children: React.ReactNode;
}

export function RoleRoute({ requiredRole, children }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (user == null || !hasMinimumRole(user.role, requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
