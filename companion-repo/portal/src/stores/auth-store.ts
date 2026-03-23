// TODO: Implement Exercise 2 — Authentication Store
// See guide B04 for requirements | Run: npm run test:exercises:05
import { create } from 'zustand';
type Role = 'customer' | 'teller' | 'manager' | 'admin';
interface User { id: string; name: string; email: string; role: Role; branch?: string; }
export type { Role, User };
export type AuthStatus = 'idle' | 'loading' | 'mfa-required' | 'authenticated' | 'unauthenticated';
interface AuthState {
  user: User | null; accessToken: string | null; isAuthenticated: boolean; status: AuthStatus;
}
// TODO: Add actions: setAuth, clearAuth, setMfaRequired, setLoading
export const useAuthStore = create<AuthState>(() => ({
  user: null, accessToken: null, isAuthenticated: false, status: 'idle',
}));
