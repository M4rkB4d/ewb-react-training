# Level 5 Answer Key — Data and Auth

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 5 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: B

Axios interceptors enable centralized concerns: auth token injection on every request, error classification and handling on every response, and audit trail headers (X-Request-ID) without modifying individual API calls. Speed (A) is not a factor. Fetch is well-supported (C). Axios does not encrypt payloads (D).

### Question 2 — Answer

Using `apiClient.post()` for the refresh call would create an infinite loop. If the refresh endpoint also returned 401 (e.g., expired refresh token), the response interceptor would try to refresh again, which would 401 again, endlessly. Using plain `axios.post()` bypasses the interceptors entirely, allowing the refresh failure to propagate cleanly to the `catch` block where auth is cleared.

### Question 3 — Answer: D

BSP 982 Section 5.4 requires tokens to be protected from XSS. In-memory storage (a JavaScript variable in a Zustand store) is the only option that is not readable by injected scripts after a page reload. localStorage (A) and sessionStorage (B) are both accessible via `window.localStorage`/`window.sessionStorage` to any script running on the page. HttpOnly cookies (C) are for the refresh token, managed by the backend — the frontend never reads them.

### Question 4 — Answer: False

JWT payloads are Base64Url-encoded, not encrypted. Anyone with the token can decode the payload and read its contents (e.g., using `atob()` or jwt.io). Only the signature is cryptographic — it proves the token was issued by the server and has not been tampered with. Never put sensitive data in JWT payloads beyond what is needed for authorization.

### Question 5 — Answer: B

When MFA is enabled, the backend returns a temporary MFA token and the list of available methods (e.g., OTP, passkey). This temporary token cannot be used to access any API endpoint — it is only valid for the MFA verification step. The actual access token is issued only after successful MFA verification.

### Question 6 — Answer

The flaw is that XSS can steal the token while the tab is still open. XSS executes in the context of the current page session. As long as the user's tab is open, any injected script can call `sessionStorage.getItem('accessToken')` and exfiltrate the token to an attacker's server. "Cleared when the tab closes" only protects against physical access to the device after the session — it does not protect against active XSS attacks during the session.

### Question 7 — Answer: B

PKCE prevents authorization code interception. In a SPA, the authorization code passes through the browser URL. A malicious browser extension or compromised redirect could capture this code. Without PKCE, the attacker could exchange the stolen code for tokens. PKCE ties the code to a cryptographic verifier that only the original client knows, making the stolen code useless without the verifier.

### Question 8 — Answer: C

Passkeys use public-key cryptography bound to the web origin. The browser enforces that a passkey created for `ewbanking.com` will only respond to authentication challenges from `ewbanking.com`. A phishing site on `ewbanking-login.com` cannot trigger the passkey because the browser checks the origin before signing. The user cannot override this — it is enforced cryptographically by the browser, not by user judgment.

### Question 9 — Answer

Not all devices and browsers support passkeys yet. Forcing a passkey-only flow would lock out users with older devices, accessibility needs, or uncommon browser configurations. The password fallback ensures no customer loses access during the transition. Additionally, passkey recovery scenarios (lost device, factory reset) require an alternative authentication path. The fallback is a safety net, not a permanent state — new accounts in Phase 3 default to passkeys.

### Question 10 — Answer: False

Frontend RBAC is a UX convenience that hides UI elements the user should not see. It is never sufficient for security. A user can bypass any frontend check by opening DevTools, modifying JavaScript, or calling the API directly. BSP 808 requires the backend to independently verify permissions on every request. A `RoleGuard` that hides the admin panel must be paired with backend middleware that rejects non-admin API calls with 403.

### Question 11 — Answer: C

BSP 982 Section 5.3 mandates a 15-minute idle timeout for banking sessions. The session timeout implementation tracks user activity (mouse, keyboard, touch, scroll) and shows a warning 2 minutes before expiry. If no activity is detected within 15 minutes, the user is automatically logged out.

### Question 12 — Answer

When the user refreshes the page, the in-memory access token is lost (Zustand state is cleared). The `useAuthInit` hook fires on mount with `status === 'idle'`. It calls `refreshSession()`, which sends a POST to `/auth/refresh` with `withCredentials: true`. The browser automatically includes the HttpOnly refresh cookie (set by the backend during the original login). If the refresh token is still valid, the backend returns a new access token and user data, which `useAuthInit` stores in the auth store. If the refresh fails (expired or invalid), `clearAuth()` is called and the user is redirected to login.

---

## Exercise Solutions

### Exercise 1 — Secure API Client with Token Refresh

```tsx
// src/lib/api-client.ts
import axios from 'axios';
import { env } from './env';
import { useAuthStore } from '@/stores/auth-store';

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor — auth token + audit headers
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token != null) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // BSP 1019 — Correlation ID for audit trail
    config.headers['X-Request-ID'] = crypto.randomUUID();
    config.headers['X-Timestamp'] = new Date().toISOString();

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 401 && originalRequest != null && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use plain axios to avoid infinite loop
        const { data } = await axios.post(
          `${env.VITE_API_BASE_URL}/auth/refresh`,
          null,
          { withCredentials: true },
        );

        useAuthStore.getState().setAuth(data.user, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
```

**Key design decisions:**
- `getState()` reads from Zustand outside React — works because Zustand stores are plain JS objects
- The `_retry` flag prevents infinite retry loops
- Plain `axios.post()` for refresh avoids interceptor recursion
- `withCredentials: true` sends the HttpOnly refresh cookie

### Exercise 2 — Login Flow with MFA Support

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
  const response = await axios.post(
    `${env.VITE_API_BASE_URL}/auth/login`,
    { username, password },
    { withCredentials: true },
  );
  return loginResponseSchema.parse(response.data);
}

// src/features/auth/components/login-form.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '../api/auth-api';
import { useAuthStore } from '@/stores/auth-store';
import { MfaForm } from './mfa-form';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mfaPending, setMfaPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (mfaPending) {
    return <MfaForm />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const result = await login(data.username, data.password);
      if (result.mfaRequired) {
        // Store MFA token in auth store; MfaForm reads it from there
        useAuthStore.getState().setMfaRequired(result.mfaToken, result.methods);
        setMfaPending(true);
      } else {
        setAuth(result.user, result.accessToken);
      }
    } catch {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-bold">Sign In</h2>

      {error != null && (
        <div role="alert" className="rounded bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          {...register('username')}
          className="mt-1 block w-full rounded border p-2"
          aria-invalid={errors.username != null}
          aria-describedby={errors.username != null ? 'username-error' : undefined}
        />
        {errors.username != null && (
          <p id="username-error" className="mt-1 text-sm text-error" role="alert">
            {errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className="mt-1 block w-full rounded border p-2"
          aria-invalid={errors.password != null}
          aria-describedby={errors.password != null ? 'password-error' : undefined}
        />
        {errors.password != null && (
          <p id="password-error" className="mt-1 text-sm text-error" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting} isLoading={isSubmitting}>
        Sign In
      </Button>
    </form>
  );
}

// src/features/auth/components/mfa-form.tsx
import { useState, useRef, useEffect } from 'react';
import { useVerifyMfa } from '../hooks/use-verify-mfa';
import { Button } from '@/components/ui/button';

// MfaForm takes no props — it reads mfaToken from the auth store internally.
// This matches B04's useVerifyMfa which accepts only `code: string`.
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
        <div role="alert" className="rounded bg-error/10 p-3 text-sm text-error">
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

**Key design decisions:**
- Discriminated union on `mfaRequired` lets TypeScript narrow the response type
- `inputMode="numeric"` shows the number pad on mobile
- `autoComplete="one-time-code"` enables browser/SMS auto-fill
- `replace(/\D/g, '')` strips any non-digit characters

### Exercise 3 — Passkey Registration and Feature Detection

```tsx
// src/features/auth/hooks/use-passkey-support.ts
export function usePasskeySupport() {
  const isSupported =
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential
      .isUserVerifyingPlatformAuthenticatorAvailable === 'function';

  return { isSupported };
}

// src/lib/webauthn-utils.ts
export function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// src/features/auth/hooks/use-passkey-register.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getRegistrationOptions, verifyRegistration } from '../api/passkey-api';
import { base64urlToBuffer } from '@/lib/webauthn-utils';

export function usePasskeyRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const options = await getRegistrationOptions();

      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        user: {
          ...options.user,
          id: base64urlToBuffer(options.user.id),
        },
        excludeCredentials: options.excludeCredentials?.map((cred) => ({
          ...cred,
          id: base64urlToBuffer(cred.id),
        })),
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      });

      if (credential == null || !(credential instanceof PublicKeyCredential)) {
        throw new Error('Failed to create passkey');
      }

      await verifyRegistration(credential);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passkeys'] });
    },
  });
}
```

**Key design decisions:**
- Feature detection checks for both the API existence and platform authenticator capability
- Base64url encoding handles the `+/=` characters that are not URL-safe
- `excludeCredentials` prevents duplicate registrations of the same authenticator
- Query invalidation refreshes the passkey list after successful registration

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
