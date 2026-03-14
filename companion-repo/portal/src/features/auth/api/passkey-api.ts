// src/features/auth/api/passkey-api.ts
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { bufferToBase64url } from '@/lib/webauthn-utils';

// --- Registration (Phase 2) ---

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

// --- Authentication (Phase 3) ---

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
  const response = await apiClient.get('/webauthn/login/options');
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

  const response = await apiClient.post('/webauthn/login/verify', {
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
