// src/features/auth/hooks/use-auth-init.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { refreshSession } from '../api/auth-api';

export function useAuthInit() {
  const { setAuth, clearAuth, status } = useAuthStore();

  useEffect(() => {
    if (status !== 'idle') return;

    let cancelled = false;

    async function init() {
      try {
        const data = await refreshSession();
        if (!cancelled) {
          setAuth(data.user, data.accessToken);
        }
      } catch {
        if (!cancelled) {
          clearAuth();
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [status, setAuth, clearAuth]);
}
