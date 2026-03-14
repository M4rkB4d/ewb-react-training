// src/lib/permissions.ts
import type { Role } from '@/types/auth';

const roleHierarchy: Record<Role, number> = {
  customer: 0,
  teller: 1,
  manager: 2,
  admin: 3,
};

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccessRoute(userRole: Role, routeRoles: Role[]): boolean {
  return routeRoles.some((role) => hasMinimumRole(userRole, role));
}
