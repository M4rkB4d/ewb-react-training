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

const authSuccessSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(['customer', 'teller', 'manager', 'admin']),
  }),
  accessToken: z.string(),
});

export async function verifyMfa(mfaToken: string, code: string): Promise<z.infer<typeof authSuccessSchema>> {
  const response = await axios.post(
    `${env.VITE_API_BASE_URL}/auth/mfa`,
    { mfaToken, code },
    { withCredentials: true },
  );
  return authSuccessSchema.parse(response.data);
}

export async function refreshSession(): Promise<z.infer<typeof authSuccessSchema>> {
  const response = await axios.post(
    `${env.VITE_API_BASE_URL}/auth/refresh`,
    null,
    { withCredentials: true },
  );
  return authSuccessSchema.parse(response.data);
}

export async function logout(): Promise<void> {
  await axios.post(
    `${env.VITE_API_BASE_URL}/auth/logout`,
    null,
    { withCredentials: true },
  );
}
