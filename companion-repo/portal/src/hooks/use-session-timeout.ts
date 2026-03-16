// src/hooks/use-session-timeout.ts
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { logout as logoutApi } from '@/features/auth/api/auth-api';

interface SessionTimeoutOptions {
  timeoutMs?: number;     // Total timeout (default: 15 minutes — BSP 982)
  warningMs?: number;     // Warning before timeout (default: 2 minutes)
}

export function useSessionTimeout(options: SessionTimeoutOptions = {}) {
  const { timeoutMs = 15 * 60 * 1000, warningMs = 2 * 60 * 1000 } = options;

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef(Date.now());

  // Store current values in refs so the effect closure always reads fresh values
  // without needing to re-register event listeners on every render.
  const clearAuthRef = useRef(clearAuth);
  clearAuthRef.current = clearAuth;

  const timeoutMsRef = useRef(timeoutMs);
  timeoutMsRef.current = timeoutMs;

  const warningMsRef = useRef(warningMs);
  warningMsRef.current = warningMs;

  // Expose resetTimers so extendSession can call it from outside the effect
  const resetTimersRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!isAuthenticated) return;

    function clearAllTimers() {
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      if (warningRef.current != null) clearTimeout(warningRef.current);
      if (countdownRef.current != null) clearInterval(countdownRef.current);
    }

    async function handleLogout() {
      setShowWarning(false);
      try {
        await logoutApi();
      } catch {
        // Logout API failure should not prevent local cleanup
      }
      clearAuthRef.current();
      window.location.href = '/login?reason=timeout';
    }

    function resetTimers() {
      lastActivityRef.current = Date.now();
      setShowWarning(false);
      clearAllTimers();

      const currentTimeout = timeoutMsRef.current;
      const currentWarning = warningMsRef.current;

      // Set warning timer
      warningRef.current = setTimeout(() => {
        setShowWarning(true);
        setRemainingSeconds(Math.floor(currentWarning / 1000));

        // Start countdown
        countdownRef.current = setInterval(() => {
          setRemainingSeconds((prev) => {
            if (prev <= 1) {
              if (countdownRef.current != null) clearInterval(countdownRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, currentTimeout - currentWarning);

      // Set logout timer
      timeoutRef.current = setTimeout(handleLogout, currentTimeout);
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      // Throttle: only reset if last activity was >1s ago
      if (Date.now() - lastActivityRef.current > 1000) {
        resetTimers();
      }
    };

    resetTimersRef.current = resetTimers;
    events.forEach((event) => { window.addEventListener(event, handleActivity); });
    resetTimers();

    return () => {
      events.forEach((event) => { window.removeEventListener(event, handleActivity); });
      clearAllTimers();
    };
  }, [isAuthenticated]);

  // Exposed for the "Extend Session" button in the warning dialog.
  // Resets both warning and logout timers via the ref-stored function.
  function extendSession() {
    resetTimersRef.current();
  }

  return {
    showWarning,
    remainingSeconds,
    extendSession,
    logoutNow: async () => {
      setShowWarning(false);
      try { await logoutApi(); } catch { /* proceed with local cleanup */ }
      clearAuth();
      window.location.href = '/login?reason=timeout';
    },
  };
}
