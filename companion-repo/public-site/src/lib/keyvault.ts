// src/lib/keyvault.ts
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { serverEnv } from './env';

const credential = new DefaultAzureCredential();
const client = new SecretClient(serverEnv.AZURE_KEY_VAULT_URL, credential);

const secretCache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getSecret(name: string): Promise<string> {
  const cached = secretCache.get(name);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const secret = await client.getSecret(name);
  const value = secret.value ?? '';

  secretCache.set(name, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return value;
}
