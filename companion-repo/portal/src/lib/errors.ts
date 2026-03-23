// TODO: Implement Exercise 1 — Error Hierarchy
// See guide A13 for requirements | Run: npm run test:exercises:06
export class AppError extends Error {
  constructor(message: string, public readonly code: string = 'UNKNOWN',
    public readonly severity: string = 'error', public readonly userMessage: string = 'An error occurred') {
    super(message); this.name = 'AppError';
  }
}
export class ValidationError extends AppError { constructor(m: string) { super(m, 'VALIDATION', 'warning', m); this.name = 'ValidationError'; } }
export class NetworkError extends AppError { constructor(m: string) { super(m, 'NETWORK', 'error', 'Network error'); this.name = 'NetworkError'; } }
export class BusinessError extends AppError { constructor(m: string) { super(m, 'BUSINESS', 'warning', m); this.name = 'BusinessError'; } }
export class SecurityError extends AppError { constructor(m: string) { super(m, 'SECURITY', 'critical', 'Security error'); this.name = 'SecurityError'; } }
export class AuthenticationError extends AppError { constructor(m: string) { super(m, 'AUTH', 'error', 'Auth failed'); this.name = 'AuthenticationError'; } }
export function isAppError(error: unknown): error is AppError { return error instanceof AppError; }
