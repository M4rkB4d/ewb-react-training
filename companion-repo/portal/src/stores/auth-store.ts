// TODO: Implement Exercise 2 — Authentication Store
// See guide B04 for requirements | Run: npm run test:exercises:05
import { create } from 'zustand';
type Role = 'admin' | 'teller' | 'customer';
interface User { id: string; username: string; role: Role; }
export type { Role, User };
export type AuthStatus = 'idle' | 'loading' | 'mfa-required' | 'authenticated' | 'unauthenticated';
interface AuthState {
  user: User | null; accessToken: string | null; isAuthenticated: boolean; status: AuthStatus;
}
// TODO: Add actions: setAuth, clearAuth, setMfaRequired, setLoading
export const useAuthStore = create<AuthState>(() => ({
  user: null, accessToken: null, isAuthenticated: false, status: 'idle',
}));
