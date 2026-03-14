// src/features/auth/hooks/use-passkey-support.ts

export function usePasskeySupport() {
  const isSupported =
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';

  return { isSupported };
}
