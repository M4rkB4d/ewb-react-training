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

type Permission =
  | 'accounts:read'
  | 'accounts:write'
  | 'transfers:create'
  | 'transfers:approve'
  | 'users:manage'
  | 'reports:view'
  | 'settings:manage';

const rolePermissions: Record<Role, Set<Permission>> = {
  customer: new Set(['accounts:read']),
  teller: new Set(['accounts:read', 'accounts:write', 'transfers:create']),
  manager: new Set(['accounts:read', 'accounts:write', 'transfers:create', 'transfers:approve', 'reports:view']),
  admin: new Set(['accounts:read', 'accounts:write', 'transfers:create', 'transfers:approve', 'users:manage', 'reports:view', 'settings:manage']),
};

export function hasPermission(role: Role | string, permission: Permission | string): boolean {
  const perms = rolePermissions[role as Role];
  if (!perms) return false;
  return perms.has(permission as Permission);
}
