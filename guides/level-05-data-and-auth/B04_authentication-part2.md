# B04 — Authentication Part 2: Implementation

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 5 — Data and Auth · Est. 3.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Implement the complete auth store with in-memory token storage
- Build a login form with MFA support
- Implement session timeout with warning dialog
- Build protected routes that redirect unauthenticated users
- Implement role-based route guards
- Handle token refresh transparently
- Write comprehensive auth tests

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A11 — Authentication Part 1 | Level 5 |
| Completed B03 — API Integration | Level 5 |
| Completed A07 — Forms and Validation | Level 3 |

---

## Phase 1 — The Auth Store

### In-memory token storage

```tsx
// src/stores/auth-store.ts
import { create } from 'zustand';

export type Role = 'customer' | 'teller' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branch?: string;
}

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
```

> **BSP 982 Critical:** The `accessToken` lives only in JavaScript memory.
> When the user closes the tab, it is gone. No localStorage. No sessionStorage.
> No cookies (that is the refresh token's job, handled by the backend).

### Checkpoint 1

What happens when the user refreshes the page? The access token is lost. How
does the application restore the authenticated state? (Hint: the refresh token
in the HttpOnly cookie.)

---

## Phase 2 — Auth API and Hooks

### Auth API functions

```tsx
// src/features/auth/api/auth-api.ts
import { z } from 'zod';
import axios from 'axios';
import { env } from '@/lib/env';

const loginResponseSchema = z.discriminatedUnion('mfaRequired', [
  z.object({
    mfaRequired: z.literal(true),
    mfaToken: z.string(),
    methods: z.array(z.string()),
  }),
  z.object({
    mfaRequired: z.literal(false),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(['customer', 'teller', 'manager', 'admin']),
    }),
    accessToken: z.string(),
  }),
]);

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export async function login(username: string, password: string): Promise<LoginResponse> {
  // Use plain axios (not apiClient) to avoid auth interceptor loop
  const response = await axios.post(
    `${env.VITE_API_BASE_URL}/auth/login`,
    { username, password },
    { withCredentials: true },
  );
  return loginResponseSchema.parse(response.data);
}

const mfaResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(['customer', 'teller', 'manager', 'admin']),
  }),
  accessToken: z.string(),
});

export async function verifyMfa(mfaToken: string, code: string): Promise<z.infer<typeof mfaResponseSchema>> {
  const response = await axios.post(
    `${env.VITE_API_BASE_URL}/auth/mfa`,
    { mfaToken, code },
    { withCredentials: true },
  );
  return mfaResponseSchema.parse(response.data);
}

export async function refreshSession(): Promise<z.infer<typeof mfaResponseSchema>> {
  const response = await axios.post(
    `${env.VITE_API_BASE_URL}/auth/refresh`,
    null,
    { withCredentials: true },
  );
  return mfaResponseSchema.parse(response.data);
}

export async function logout(): Promise<void> {
  await axios.post(
    `${env.VITE_API_BASE_URL}/auth/logout`,
    null,
    { withCredentials: true },
  );
}
```

### Login hook

```tsx
// src/features/auth/hooks/use-login.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { login } from '../api/auth-api';
import { useAuthStore } from '@/stores/auth-store';

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth, setMfaRequired, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),

    onMutate: () => {
      setLoading();
    },

    onSuccess: (data) => {
      if (data.mfaRequired) {
        setMfaRequired(data.mfaToken, data.methods);
      } else {
        setAuth(data.user, data.accessToken);
        navigate('/dashboard');
      }
    },

    onError: () => {
      setError();
    },
  });
}
```

### MFA verification hook

```tsx
// src/features/auth/hooks/use-verify-mfa.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { verifyMfa } from '../api/auth-api';
import { useAuthStore } from '@/stores/auth-store';

export function useVerifyMfa() {
  const navigate = useNavigate();
  const { setAuth, mfaToken } = useAuthStore();

  return useMutation({
    mutationFn: (code: string) => {
      if (mfaToken == null) {
        throw new Error('No MFA token available');
      }
      return verifyMfa(mfaToken, code);
    },

    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate('/dashboard');
    },
  });
}
```

### Checkpoint 2

Why do the auth API functions use plain `axios` instead of the `apiClient` from
B03?

---

## Phase 3 — Login Form

### Login form with MFA step

```tsx
// src/features/auth/components/login-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks/use-login';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MfaForm } from './mfa-form';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const status = useAuthStore((state) => state.status);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Show MFA form if credentials were accepted
  if (status === 'mfa-required') {
    return <MfaForm />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h1 className="text-2xl font-bold text-ewb-purple">Sign In</h1>

      {loginMutation.isError && (
        <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          Invalid username or password. Please try again.
        </div>
      )}

      <Input
        label="Username"
        {...register('username')}
        error={errors.username?.message}
        autoComplete="username"
        autoFocus
      />

      <Input
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
```

### MFA form

```tsx
// src/features/auth/components/mfa-form.tsx
import { useState, useRef, useEffect } from 'react';
import { useVerifyMfa } from '../hooks/use-verify-mfa';
import { Button } from '@/components/ui/button';

export function MfaForm() {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const verifyMfa = useVerifyMfa();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length === 6) {
      verifyMfa.mutate(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Verification Required</h2>
      <p className="text-sm text-gray-600">
        Enter the 6-digit code from your authenticator app.
      </p>

      {verifyMfa.isError && (
        <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          Invalid code. Please try again.
        </div>
      )}

      <div>
        <label htmlFor="mfa-code" className="sr-only">Verification code</label>
        <input
          id="mfa-code"
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{6}"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className="w-full rounded border p-3 text-center text-2xl tracking-widest"
          aria-describedby="mfa-help"
        />
        <p id="mfa-help" className="mt-1 text-xs text-gray-500">
          6-digit verification code
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={code.length !== 6 || verifyMfa.isPending}
      >
        {verifyMfa.isPending ? 'Verifying...' : 'Verify'}
      </Button>
    </form>
  );
}
```

Key accessibility details:
- `inputMode="numeric"` shows the number keyboard on mobile
- `autoComplete="one-time-code"` allows browser/OS to auto-fill from SMS
- `pattern` enables built-in validation
- Non-digit characters are stripped on input

---

## Phase 4 — Session Timeout

### Session timeout hook

```tsx
// src/hooks/use-session-timeout.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { logout as logoutApi } from '@/features/auth/api/auth-api';

interface SessionTimeoutOptions {
  timeoutMs?: number;     // Total timeout (default: 15 minutes — BSP 982)
  warningMs?: number;     // Warning before timeout (default: 2 minutes)
}

export function useSessionTimeout(options: SessionTimeoutOptions = {}) {
  const { timeoutMs = 15 * 60 * 1000, warningMs = 2 * 60 * 1000 } = options;

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const warningRef = useRef<ReturnType<typeof setTimeout>>();
  const countdownRef = useRef<ReturnType<typeof setInterval>>();
  const lastActivityRef = useRef(Date.now());

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    try {
      await logoutApi();
    } catch {
      // Logout API failure should not prevent local cleanup
    }
    clearAuth();
    window.location.href = '/login?reason=timeout';
  }, [clearAuth]);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);

    if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    if (warningRef.current != null) clearTimeout(warningRef.current);
    if (countdownRef.current != null) clearInterval(countdownRef.current);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(Math.floor(warningMs / 1000));

      // Start countdown
      countdownRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (countdownRef.current != null) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeoutMs - warningMs);

    // Set logout timer
    timeoutRef.current = setTimeout(handleLogout, timeoutMs);
  }, [timeoutMs, warningMs, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      if (Date.now() - lastActivityRef.current > 1000) {
        resetTimers();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimers();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      if (warningRef.current != null) clearTimeout(warningRef.current);
      if (countdownRef.current != null) clearInterval(countdownRef.current);
    };
  }, [isAuthenticated, resetTimers]);

  return {
    showWarning,
    remainingSeconds,
    extendSession: resetTimers,
    logoutNow: handleLogout,
  };
}
```

### Session warning dialog

```tsx
// src/components/auth/session-warning-dialog.tsx
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import { Button } from '@/components/ui/button';

export function SessionWarningDialog() {
  const { showWarning, remainingSeconds, extendSession, logoutNow } =
    useSessionTimeout();

  if (!showWarning) return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="session-title"
      aria-describedby="session-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="rounded-lg bg-white p-6 shadow-xl">
        <h2 id="session-title" className="text-lg font-bold">
          Session Expiring
        </h2>
        <p id="session-desc" className="mt-2 text-gray-600">
          Your session will expire in{' '}
          <span className="font-mono font-bold text-red-600">
            {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
          </span>
          . Would you like to continue?
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={extendSession}>Continue Session</Button>
          <Button variant="outline" onClick={logoutNow}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Checkpoint 3

Why does the `handleActivity` function check `Date.now() - lastActivityRef.current > 1000`
before resetting timers? What would happen without this throttle?

---

## Phase 5 — Protected Routes

### Auth-aware route guard

```tsx
// src/components/auth/protected-route.tsx
import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve the intended destination for post-login redirect
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
```

### Role-based route guard

```tsx
// src/components/auth/role-route.tsx
import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';
import { hasMinimumRole } from '@/lib/permissions';
import type { Role } from '@/stores/auth-store';

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
```

### Post-login redirect

```tsx
// src/features/auth/hooks/use-login.ts (updated)
import { useLocation } from 'react-router';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page the user was trying to visit before being redirected
  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  return useMutation({
    // ... same as before
    onSuccess: (data) => {
      if (data.mfaRequired) {
        setMfaRequired(data.mfaToken, data.methods);
      } else {
        setAuth(data.user, data.accessToken);
        navigate(from, { replace: true });
      }
    },
  });
}
```

### Route configuration with guards

```tsx
// src/router.tsx (relevant section)
import { ProtectedRoute } from '@/components/auth/protected-route';
import { RoleRoute } from '@/components/auth/role-route';

const router = createBrowserRouter([
  {
    path: '/login',
    lazy: () => import('./pages/login-page'),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        lazy: () => import('./pages/dashboard-page'),
      },
      {
        path: 'accounts',
        lazy: () => import('./pages/accounts-page'),
      },
      {
        path: 'admin',
        element: (
          <RoleRoute requiredRole="admin">
            <AdminLayout />
          </RoleRoute>
        ),
        children: [
          {
            path: 'users',
            lazy: () => import('./pages/admin/users-page'),
          },
        ],
      },
    ],
  },
]);
```

---

## Phase 6 — App Initialization

### Restoring auth on page load

When the user refreshes the page, the access token is lost (it was in memory).
The app must check if a valid refresh token exists:

```tsx
// src/features/auth/hooks/use-auth-init.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { refreshSession } from '../api/auth-api';

export function useAuthInit() {
  const { setAuth, clearAuth, status } = useAuthStore();

  useEffect(() => {
    if (status !== 'idle') return;

    let cancelled = false;

    async function init() {
      try {
        const data = await refreshSession();
        if (!cancelled) {
          setAuth(data.user, data.accessToken);
        }
      } catch {
        if (!cancelled) {
          clearAuth();
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [status, setAuth, clearAuth]);
}
```

```tsx
// src/app.tsx
import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { router } from '@/router';
import { useAuthInit } from '@/features/auth/hooks/use-auth-init';
import { useAuthStore } from '@/stores/auth-store';
import { SessionWarningDialog } from '@/components/auth/session-warning-dialog';

function AppInner() {
  useAuthInit();
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div aria-busy="true">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <SessionWarningDialog />
    </>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
```

### Checkpoint 4

Why does `useAuthInit` check `status !== 'idle'` before running? What would
happen if it ran on every render?

---

## Phase 7 — Testing Auth

### Testing the auth store

```tsx
// src/stores/auth-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      status: 'idle',
      mfaToken: null,
      mfaMethods: [],
    });
  });

  it('starts in idle state', () => {
    const state = useAuthStore.getState();
    expect(state.status).toBe('idle');
    expect(state.isAuthenticated).toBe(false);
  });

  it('transitions to authenticated on setAuth', () => {
    const user = { id: '1', name: 'Juan', email: 'juan@ewb.com', role: 'customer' as const };
    useAuthStore.getState().setAuth(user, 'token-123');

    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('token-123');
  });

  it('transitions to mfa-required', () => {
    useAuthStore.getState().setMfaRequired('mfa-token', ['otp', 'passkey']);

    const state = useAuthStore.getState();
    expect(state.status).toBe('mfa-required');
    expect(state.mfaToken).toBe('mfa-token');
    expect(state.mfaMethods).toEqual(['otp', 'passkey']);
  });

  it('clears all state on clearAuth', () => {
    const user = { id: '1', name: 'Juan', email: 'juan@ewb.com', role: 'customer' as const };
    useAuthStore.getState().setAuth(user, 'token-123');
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });
});
```

### Testing protected routes

```tsx
// src/components/auth/protected-route.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import { ProtectedRoute } from './protected-route';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      status: 'unauthenticated',
      mfaToken: null,
      mfaMethods: [],
    });
  });

  it('redirects to /login when unauthenticated', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({
      user: { id: '1', name: 'Juan', email: 'juan@ewb.com', role: 'customer' },
      accessToken: 'token',
      isAuthenticated: true,
      status: 'authenticated',
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

---

## Key Takeaways

1. **The auth store is the single source of truth** for authentication state.
   All auth decisions flow from it.

2. **Login flow supports MFA** with a discriminated union response. The UI
   transitions between credential entry and MFA verification based on
   `status`.

3. **Session timeout is 15 minutes** (BSP 982). The warning appears 2 minutes
   before expiry with a countdown.

4. **Post-login redirect** preserves the user's intended destination. The
   `from` state in React Router carries the original path through the login
   flow.

5. **Auth initialization** attempts a silent refresh on page load. If the
   refresh token is valid, the user is automatically authenticated.

6. **Test auth thoroughly** — auth bugs in banking are compliance violations.
   Test every state transition, every redirect, every edge case.

---

## Exercises

### Exercise 1 — Re-authentication for Sensitive Operations
Implement a `useReAuth` hook that prompts the user to re-enter their password
before executing a high-risk operation (transfer > 50,000 PHP). Include the
re-auth dialog component.

### Exercise 2 — Login Attempt Limiting
Add client-side rate limiting to the login form: after 5 failed attempts, disable
the form for 30 seconds with a countdown. Show remaining attempts after the 3rd
failure.

### Exercise 3 — Auth State Debugging
Build a `DevAuthPanel` component (only shown in development) that displays the
current auth state, access token expiry, and provides buttons to simulate
token expiration and session timeout.

---

## What Comes Next

**Next guide:** [A12 — Passkeys and WebAuthn](A12_passkeys-and-webauthn.md) —
where you implement phishing-resistant authentication with passkeys to meet
the AFASA June 2026 deadline.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
