// src/lib/keyvault.ts
import { serverEnv } from './env';

const secretCache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let client: import('@azure/keyvault-secrets').SecretClient | null = null;

function getClient() {
  if (client == null) {
    // Lazy import — avoids crashing at module load when Azure CLI is not authenticated
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DefaultAzureCredential } = require('@azure/identity') as typeof import('@azure/identity');
    const { SecretClient } = require('@azure/keyvault-secrets') as typeof import('@azure/keyvault-secrets');
    const credential = new DefaultAzureCredential();
    client = new SecretClient(serverEnv.AZURE_KEY_VAULT_URL, credential);
  }
  return client;
}

export async function getSecret(name: string): Promise<string> {
  const cached = secretCache.get(name);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const secret = await getClient().getSecret(name);
  const value = secret.value ?? '';

  secretCache.set(name, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return value;
}
