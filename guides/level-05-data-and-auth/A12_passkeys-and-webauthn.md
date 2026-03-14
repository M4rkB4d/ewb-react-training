# A12 — Passkeys and WebAuthn

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 5 — Data and Auth · Est. 3 hours

---

## What You Will Learn

By the end of this guide, you will:

- Understand FIDO2, WebAuthn, and passkeys
- Know why passkeys are phishing-resistant
- Implement passkey registration (enrollment)
- Implement passkey authentication (login)
- Build a passkey management UI
- Design the migration strategy from passwords to passkeys
- Meet the BSP Circular 1213 (AFASA) requirements

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A11 — Authentication Part 1 | Level 5 |
| Completed B04 — Authentication Part 2 | Level 5 |

---

## Phase 1 — Why Passkeys

### The phishing problem

Every traditional authentication method can be phished:

| Method | Attack |
|--------|--------|
| Password | Fake login page captures it |
| SMS OTP | SIM swap, SS7 interception, real-time proxy |
| Email OTP | Email account compromise |
| TOTP app | Real-time phishing proxy relays codes |
| Push notification | MFA fatigue (spam until user approves) |

Banks are prime phishing targets. BSP Circular 1213 (AFASA) mandates
phishing-resistant authentication by June 2026 because phishing attacks on
Philippine banks have increased significantly.

### What makes passkeys different

Passkeys use **public-key cryptography** bound to the **origin** (domain):

1. The browser creates a key pair (public + private)
2. The private key stays on the user's device (never leaves)
3. The public key is sent to the server
4. During login, the server sends a challenge
5. The browser signs the challenge with the private key
6. The server verifies with the public key

The critical difference: **the browser checks the origin**. A passkey created
for `ewbanking.com` will never respond to a challenge from `ewbanking-login.com`.
The browser enforces this — the user cannot override it.

### FIDO2 terminology

| Term | What It Is |
|------|-----------|
| **FIDO2** | The umbrella standard (FIDO Alliance) |
| **WebAuthn** | The browser API (W3C standard) |
| **CTAP2** | The protocol between browser and authenticator |
| **Passkey** | A FIDO2 credential that syncs across devices |
| **Authenticator** | The device/software that creates and stores keys |
| **Relying Party (RP)** | The server (EWB's backend) |
| **Credential ID** | Unique identifier for a registered passkey |
| **Challenge** | Random bytes from the server to prevent replay attacks |

### Passkey vs security key

| | Passkey | Security Key |
|-|---------|-------------|
| Syncs across devices | Yes (iCloud, Google, etc.) | No (one device) |
| User experience | Biometric/PIN on any device | Must have the physical key |
| Recovery if lost | Cloud backup | Must register a backup key |
| EWB recommendation | Primary for customers | Optional for high-security |

### Checkpoint 1

A customer asks: "If my phone is stolen, can someone use my passkeys?" Explain
the security model that protects passkeys on a stolen device.

Answer: Passkeys require user verification (biometric or device PIN) before use.
A stolen phone with a lock screen prevents passkey usage. Additionally, passkeys
synced via iCloud Keychain or Google Password Manager are encrypted end-to-end
and require the user's Apple/Google account password to access on a new device.

---

## Phase 2 — WebAuthn Registration

### Registration flow

```
User            Frontend               Backend             Authenticator
  │                │                      │                     │
  │── Click ──────→│                      │                     │
  │  "Add Passkey" │── GET /webauthn/ ───→│                     │
  │                │   register/options   │                     │
  │                │←─ PublicKeyOptions ──│                     │
  │                │                      │                     │
  │                │── navigator.         │                     │
  │                │   credentials.       │                     │
  │                │   create(options) ──────────────────────→│
  │                │                      │                     │
  │←── Biometric ──────────────────────────────────────────── │
  │   prompt       │                      │                     │
  │── Approve ─────────────────────────────────────────────→│
  │                │                      │                     │
  │                │←── credential ──────────────────────────│
  │                │                      │                     │
  │                │── POST /webauthn/ ──→│                     │
  │                │   register/verify    │                     │
  │                │   { credential }     │── Store public ───→│
  │                │                      │   key + credId     │
  │                │←─ { success } ──────│                     │
  │←── "Passkey ──│                      │                     │
  │    registered" │                      │                     │
```

### Registration API

```tsx
// src/features/auth/api/passkey-api.ts
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

const registrationOptionsSchema = z.object({
  challenge: z.string(),
  rp: z.object({
    id: z.string(),
    name: z.string(),
  }),
  user: z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
  }),
  pubKeyCredParams: z.array(z.object({
    type: z.literal('public-key'),
    alg: z.number(),
  })),
  timeout: z.number(),
  authenticatorSelection: z.object({
    authenticatorAttachment: z.string().optional(),
    residentKey: z.string(),
    userVerification: z.string(),
  }),
  attestation: z.string(),
  excludeCredentials: z.array(z.object({
    id: z.string(),
    type: z.literal('public-key'),
  })).optional(),
});

export type RegistrationOptions = z.infer<typeof registrationOptionsSchema>;

export async function getRegistrationOptions(): Promise<RegistrationOptions> {
  const response = await apiClient.get('/webauthn/register/options');
  return registrationOptionsSchema.parse(response.data);
}

export async function verifyRegistration(credential: PublicKeyCredential): Promise<void> {
  const attestationResponse = credential.response as AuthenticatorAttestationResponse;

  await apiClient.post('/webauthn/register/verify', {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    response: {
      clientDataJSON: bufferToBase64url(attestationResponse.clientDataJSON),
      attestationObject: bufferToBase64url(attestationResponse.attestationObject),
    },
    type: credential.type,
  });
}
```

### Base64url utilities

```tsx
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
```

### Registration hook

```tsx
// src/features/auth/hooks/use-passkey-register.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getRegistrationOptions, verifyRegistration } from '../api/passkey-api';
import { base64urlToBuffer } from '@/lib/webauthn-utils';

export function usePasskeyRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 1. Get options from server
      const options = await getRegistrationOptions();

      // 2. Convert base64url strings to ArrayBuffers for the browser API
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

      // 3. Call the browser's WebAuthn API
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      });

      if (credential == null || !(credential instanceof PublicKeyCredential)) {
        throw new Error('Failed to create passkey');
      }

      // 4. Send the credential to the server for verification
      await verifyRegistration(credential);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passkeys'] });
    },
  });
}
```

### Checkpoint 2

Why does the server send `excludeCredentials` in the registration options?
What would happen if a user registered the same passkey twice?

---

## Phase 3 — WebAuthn Authentication

### Authentication flow

```
User            Frontend               Backend             Authenticator
  │                │                      │                     │
  │── Click ──────→│                      │                     │
  │  "Sign in      │── GET /webauthn/ ───→│                     │
  │   with Passkey"│   login/options      │                     │
  │                │←─ PublicKeyOptions ──│                     │
  │                │                      │                     │
  │                │── navigator.         │                     │
  │                │   credentials.       │                     │
  │                │   get(options) ─────────────────────────→│
  │                │                      │                     │
  │←── Biometric ──────────────────────────────────────────── │
  │   prompt       │                      │                     │
  │── Approve ─────────────────────────────────────────────→│
  │                │                      │                     │
  │                │←── assertion ───────────────────────────│
  │                │                      │                     │
  │                │── POST /webauthn/ ──→│                     │
  │                │   login/verify       │── Verify           │
  │                │   { assertion }      │   signature        │
  │                │←─ { user, token } ──│                     │
  │←── Dashboard ──│                      │                     │
```

### Authentication API

```tsx
// src/features/auth/api/passkey-api.ts (continued)
import axios from 'axios';
import { env } from '@/lib/env';

const authOptionsSchema = z.object({
  challenge: z.string(),
  timeout: z.number(),
  rpId: z.string(),
  allowCredentials: z.array(z.object({
    id: z.string(),
    type: z.literal('public-key'),
  })).optional(),
  userVerification: z.string(),
});

export async function getAuthenticationOptions(): Promise<z.infer<typeof authOptionsSchema>> {
  // Use plain axios — user is not yet authenticated, so apiClient's token
  // interceptor would send an empty Authorization header.
  const response = await axios.get(`${env.VITE_API_BASE_URL}/webauthn/login/options`, { withCredentials: true });
  return authOptionsSchema.parse(response.data);
}

const authResultSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(['customer', 'teller', 'manager', 'admin']),
  }),
  accessToken: z.string(),
});

export async function verifyAuthentication(credential: PublicKeyCredential): Promise<z.infer<typeof authResultSchema>> {
  const assertionResponse = credential.response as AuthenticatorAssertionResponse;

  const response = await axios.post(`${env.VITE_API_BASE_URL}/webauthn/login/verify`, {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    response: {
      clientDataJSON: bufferToBase64url(assertionResponse.clientDataJSON),
      authenticatorData: bufferToBase64url(assertionResponse.authenticatorData),
      signature: bufferToBase64url(assertionResponse.signature),
      userHandle: assertionResponse.userHandle != null
        ? bufferToBase64url(assertionResponse.userHandle)
        : null,
    },
    type: credential.type,
  });

  return authResultSchema.parse(response.data);
}
```

### Authentication hook

```tsx
// src/features/auth/hooks/use-passkey-login.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { getAuthenticationOptions, verifyAuthentication } from '../api/passkey-api';
import { useAuthStore } from '@/stores/auth-store';
import { base64urlToBuffer } from '@/lib/webauthn-utils';

export function usePasskeyLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async () => {
      // 1. Get options from server
      const options = await getAuthenticationOptions();

      // 2. Convert to browser API format
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64urlToBuffer(options.challenge),
        timeout: options.timeout,
        rpId: options.rpId,
        allowCredentials: options.allowCredentials?.map((cred) => ({
          ...cred,
          id: base64urlToBuffer(cred.id),
        })),
        userVerification: options.userVerification as UserVerificationRequirement,
      };

      // 3. Call the browser's WebAuthn API
      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions,
      });

      if (credential == null || !(credential instanceof PublicKeyCredential)) {
        throw new Error('Failed to authenticate with passkey');
      }

      // 4. Verify with server
      return verifyAuthentication(credential);
    },

    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate('/dashboard');
    },
  });
}
```

### Checkpoint 3

During passkey login, the server sends a `challenge` (random bytes). Why is this
necessary? What attack does it prevent?

Answer: The challenge prevents replay attacks. Without a challenge, an attacker
could capture a valid assertion and replay it later. The challenge ensures each
authentication attempt is unique — the server generates a new random challenge
for each login attempt and rejects any assertion signed with a stale challenge.

---

## Phase 4 — Passkey Management UI

### Feature detection

```tsx
// src/features/auth/hooks/use-passkey-support.ts
import { useState, useEffect } from 'react';

export function usePasskeySupport() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    async function checkSupport() {
      if (
        typeof window === 'undefined' ||
        window.PublicKeyCredential === undefined ||
        typeof window.PublicKeyCredential
          .isUserVerifyingPlatformAuthenticatorAvailable !== 'function'
      ) {
        setIsSupported(false);
        return;
      }

      // Actually call the check — the function existing does not mean
      // the device has a platform authenticator (e.g., fingerprint, Face ID).
      try {
        const available =
          await window.PublicKeyCredential
            .isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
      } catch {
        setIsSupported(false);
      }
    }

    checkSupport();
  }, []);

  return { isSupported };
}
```

### Passkey enrollment component

```tsx
// src/features/auth/components/passkey-enrollment.tsx
import { usePasskeyRegister } from '../hooks/use-passkey-register';
import { usePasskeySupport } from '../hooks/use-passkey-support';
import { Button } from '@/components/ui/button';

export function PasskeyEnrollment() {
  const { isSupported } = usePasskeySupport();
  const register = usePasskeyRegister();

  if (!isSupported) {
    return (
      <div className="rounded bg-amber-50 p-4 text-sm text-amber-800">
        Your browser does not support passkeys. Please use a modern browser
        (Chrome 109+, Safari 16+, Firefox 122+) for enhanced security.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded border p-6">
      <div>
        <h3 className="text-lg font-semibold">Set Up Passkey</h3>
        <p className="mt-1 text-sm text-gray-600">
          Passkeys let you sign in with your fingerprint, face, or device PIN.
          No password needed.
        </p>
      </div>

      {register.isError && (
        <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {register.error instanceof DOMException &&
           register.error.name === 'NotAllowedError'
            ? 'Passkey setup was cancelled. You can try again when ready.'
            : 'Failed to register passkey. Please try again.'}
        </div>
      )}

      {register.isSuccess && (
        <div role="status" className="rounded bg-green-50 p-3 text-sm text-green-700">
          Passkey registered successfully.
        </div>
      )}

      <Button
        onClick={() => register.mutate()}
        disabled={register.isPending}
      >
        {register.isPending ? 'Setting up...' : 'Add Passkey'}
      </Button>
    </div>
  );
}
```

### Passkey list and management

```tsx
// src/features/auth/components/passkey-settings.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { z } from 'zod';
import { PasskeyEnrollment } from './passkey-enrollment';
import { Button } from '@/components/ui/button';

const passkeySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().nullable(),
  deviceType: z.string(),
});

type Passkey = z.infer<typeof passkeySchema>;

function usePasskeys() {
  return useQuery({
    queryKey: ['passkeys'],
    queryFn: async () => {
      const response = await apiClient.get('/webauthn/credentials');
      return z.array(passkeySchema).parse(response.data);
    },
  });
}

function useDeletePasskey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/webauthn/credentials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passkeys'] });
    },
  });
}

export function PasskeySettings() {
  const { data: passkeys, isLoading } = usePasskeys();
  const deletePasskey = useDeletePasskey();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Passkeys</h2>
        <p className="text-sm text-gray-600">
          Manage your registered passkeys for passwordless sign-in.
        </p>
      </div>

      <PasskeyEnrollment />

      {isLoading && <p aria-busy="true">Loading passkeys...</p>}

      {passkeys != null && passkeys.length > 0 && (
        <ul className="divide-y rounded border" role="list" aria-label="Registered passkeys">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{passkey.name}</p>
                <p className="text-xs text-gray-500">
                  {passkey.deviceType} · Added{' '}
                  {new Date(passkey.createdAt).toLocaleDateString('en-PH')}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm('Remove this passkey? You will not be able to sign in with it.')) {
                    deletePasskey.mutate(passkey.id);
                  }
                }}
                disabled={deletePasskey.isPending}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Phase 5 — Login Page with Passkey Option

### Combined login form

```tsx
// src/pages/login-page.tsx
import { LoginForm } from '@/features/auth/components/login-form';
import { usePasskeyLogin } from '@/features/auth/hooks/use-passkey-login';
import { usePasskeySupport } from '@/features/auth/hooks/use-passkey-support';
import { Button } from '@/components/ui/button';

export function Component() {
  const { isSupported } = usePasskeySupport();
  const passkeyLogin = usePasskeyLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ewb-purple">
            EastWest Digital Banking
          </h1>
          <p className="mt-1 text-sm text-gray-600">Sign in to your account</p>
        </div>

        {isSupported && (
          <>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => passkeyLogin.mutate()}
              disabled={passkeyLogin.isPending}
            >
              {passkeyLogin.isPending ? 'Authenticating...' : 'Sign in with Passkey'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>
          </>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
```

### Checkpoint 4

Why is the passkey sign-in button shown above the traditional login form? What
user behavior does this encourage?

---

## Phase 6 — Migration Strategy

### Phased rollout

```
Phase 1 (Now)         Phase 2 (April)       Phase 3 (June)
Optional enrollment   Prompted enrollment   Required for new users
  │                     │                     │
  │ Staff first         │ Customer prompts    │ Password + passkey OR
  │ Passkey as           │ Post-login nudge    │ passkey-only for new
  │ second factor       │ Passkey as primary  │ accounts
  │                     │                     │
  │ Password remains    │ Password remains    │ Existing users retain
  │ primary             │ as fallback         │ password fallback
```

### Enrollment prompt component

```tsx
// src/features/auth/components/passkey-prompt.tsx
import { useState } from 'react';
import { usePasskeyRegister } from '../hooks/use-passkey-register';
import { usePasskeySupport } from '../hooks/use-passkey-support';
import { Button } from '@/components/ui/button';

interface PasskeyPromptProps {
  onDismiss: () => void;
}

export function PasskeyPrompt({ onDismiss }: PasskeyPromptProps) {
  const { isSupported } = usePasskeySupport();
  const register = usePasskeyRegister();
  const [dismissed, setDismissed] = useState(false);

  if (!isSupported || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <div
      role="complementary"
      aria-label="Passkey enrollment suggestion"
      className="rounded-lg border border-ewb-purple/20 bg-ewb-purple/5 p-4"
    >
      <h3 className="font-semibold text-ewb-purple">
        Upgrade to Passkey Sign-In
      </h3>
      <p className="mt-1 text-sm text-gray-700">
        Sign in faster and more securely with your fingerprint or face.
        No more passwords to remember.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          onClick={() => register.mutate()}
          disabled={register.isPending}
        >
          {register.isPending ? 'Setting up...' : 'Set Up Now'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Maybe Later
        </Button>
      </div>
    </div>
  );
}
```

### AFASA compliance checklist

| Requirement | Implementation | Status |
|------------|---------------|--------|
| Phishing-resistant auth | WebAuthn/passkeys | Guide A12 |
| User verification | Biometric or device PIN | Browser handles |
| Credential binding | Origin-bound keys | WebAuthn spec |
| Recovery mechanism | Multiple passkeys + password fallback | Phase 3 design |
| Audit logging | All auth events logged | B06 guide |
| Enrollment UX | Progressive prompts | Phase 2 rollout |

---

## Key Takeaways

1. **Passkeys are phishing-resistant** because they are cryptographically bound
   to the origin. A passkey for `ewbanking.com` will never work on a fake domain.

2. **WebAuthn is a browser API** — `navigator.credentials.create()` for
   registration, `navigator.credentials.get()` for authentication. The browser
   handles all cryptographic operations.

3. **Base64url encoding** is required to transmit binary WebAuthn data as JSON.
   Always convert ArrayBuffers to base64url for transport and back for the
   browser API.

4. **Feature detection** is essential — not all browsers support passkeys.
   Always provide a password fallback.

5. **Migration is phased** — staff first, then customer prompts, then required
   for new accounts. Existing users always retain a password fallback during
   the transition.

6. **Challenges prevent replay attacks.** The server generates a fresh random
   challenge for every registration and authentication attempt.

---

## Exercises

### Exercise 1 — Conditional UI
Build a `useConditionalMediation` hook that uses WebAuthn's conditional UI
(`mediation: 'conditional'`) to show passkey suggestions in the username input
field's autocomplete dropdown.

### Exercise 2 — Multi-Device Registration
Extend the passkey settings page to differentiate between platform authenticators
(built into the device) and roaming authenticators (USB security keys). Show
different icons and descriptions for each type.

### Exercise 3 — Passkey Recovery Flow
Design and document (with flow diagrams) a recovery process for a user who has
lost all their registered passkeys. Consider: identity verification, temporary
access, re-enrollment, and BSP compliance.

---

## What Comes Next

Level 5 is complete. You have API integration, authentication, and passkeys.
Level 6 focuses on quality — error handling, performance, advanced testing,
and monitoring.

**Next guide:** [A13 — Error Handling](../level-06-quality/A13_error-handling.md)

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
