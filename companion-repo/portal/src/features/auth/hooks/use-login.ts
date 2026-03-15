// src/features/auth/hooks/use-login.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router';
import { login } from '../api/auth-api';
import { useAuthStore } from '@/stores/auth-store';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, setMfaRequired, setLoading, setError } = useAuthStore();

  // Get the page the user was trying to visit before being redirected
  const from = (location.state as { from?: string })?.from ?? '/';

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),

    onMutate: () => {
      setLoading();
    },

    onSuccess: (data) => {
      if (data.mfaRequired) {
        setMfaRequired(data.mfaToken, data.methods);
      } else {
        setAuth(data.user, data.accessToken);
        navigate(from, { replace: true });
      }
    },

    onError: () => {
      setError();
    },
  });
}
