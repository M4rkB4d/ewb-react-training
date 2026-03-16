// src/components/auth/role-guard.tsx
import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';
import { hasMinimumRole } from '@/lib/permissions';
import type { Role } from '@/types/auth';

interface RoleGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
}

export function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasMinimumRole(user.role, requiredRole)) {
    // Log the unauthorized access attempt (BSP 1019)
    console.warn(`Access denied: user ${user.id} attempted to access role-restricted route`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
