// src/test/factories/user-factory.ts
import type { User } from '@/types/auth';

let idCounter = 0;

function nextId(): string {
  idCounter += 1;
  return `user-${idCounter}`;
}

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: nextId(),
    name: 'Juan Santos',
    email: 'juan.santos@ewb.com',
    role: 'customer',
    ...overrides,
  };
}

export function createAdmin(overrides: Partial<User> = {}): User {
  return createUser({ role: 'admin', name: 'Admin User', ...overrides });
}

export function createTeller(overrides: Partial<User> = {}): User {
  return createUser({ role: 'teller', name: 'Maria Cruz', branch: 'BGC', ...overrides });
}
