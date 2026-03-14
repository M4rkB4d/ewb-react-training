// src/components/auth/role-guard.tsx
import { useAuthStore } from '@/stores/auth-store';
import { hasMinimumRole } from '@/lib/permissions';
import type { Role } from '@/types/auth';

interface RoleGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ requiredRole, children, fallback = null }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (user == null || !hasMinimumRole(user.role, requiredRole)) {
    return fallback;
  }

  return children;
}
