// src/features/auth/hooks/use-auth-init.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { refreshSession } from '../api/auth-api';

export function useAuthInit() {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status !== 'idle') return;

    // Access actions inside the effect — stable references from getState()
    const { setAuth, clearAuth } = useAuthStore.getState();
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
  }, [status]);
}
