// src/stores/auth-store.ts
import { create } from 'zustand';
import type { Role, User } from '@/types/auth';

export type { Role, User };

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'mfa-required'
  | 'authenticated'
  | 'unauthenticated';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  mfaToken: string | null;
  mfaMethods: string[];

  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setMfaRequired: (mfaToken: string, methods: string[]) => void;
  setLoading: () => void;
  setError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  status: 'idle',
  mfaToken: null,
  mfaMethods: [],

  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      status: 'authenticated',
      mfaToken: null,
      mfaMethods: [],
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      status: 'unauthenticated',
      mfaToken: null,
      mfaMethods: [],
    }),

  setMfaRequired: (mfaToken, mfaMethods) =>
    set({
      status: 'mfa-required',
      mfaToken,
      mfaMethods,
    }),

  setLoading: () => set({ status: 'loading' }),

  setError: () => set({ status: 'unauthenticated' }),
}));
