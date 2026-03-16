// src/features/auth/hooks/use-verify-mfa.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { verifyMfa } from '../api/auth-api';
import { useAuthStore } from '@/stores/auth-store';

export function useVerifyMfa() {
  const navigate = useNavigate();
  const mfaToken = useAuthStore((state) => state.mfaToken);
  const { setAuth } = useAuthStore.getState();

  return useMutation({
    mutationFn: (code: string) => {
      if (mfaToken == null) {
        throw new Error('No MFA token available');
      }
      return verifyMfa(mfaToken, code);
    },

    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate('/');
    },
  });
}
