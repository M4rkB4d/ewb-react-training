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
