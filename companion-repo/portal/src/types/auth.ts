// src/types/auth.ts
export type Role = 'customer' | 'teller' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branch?: string;
  permissions?: string[];
}

export type AuthStep =
  | { status: 'idle' }
  | { status: 'credentials' }
  | { status: 'mfa-required'; mfaToken: string; methods: string[] }
  | { status: 'mfa-verifying' }
  | { status: 'authenticated' }
  | { status: 'error'; message: string };
