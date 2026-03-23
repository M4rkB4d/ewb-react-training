// TODO: Implement Exercise 3 — Role-Based Permissions
// See guide A14 for requirements | Run: npm run test:exercises:07
type Role = 'admin' | 'teller' | 'customer';
type Permission = string;
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean { return false; }
export function canAccessRoute(userRole: Role, routeRoles: Role[]): boolean { return false; }
export function hasPermission(role: Role, permission: Permission): boolean { return false; }
