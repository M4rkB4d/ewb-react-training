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
      const publicKeyOptions = {
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
      } as PublicKeyCredentialCreationOptions;

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
