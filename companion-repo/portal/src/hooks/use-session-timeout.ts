// src/hooks/use-session-timeout.ts
import { useEffect, useRef, useCallback, useState } from 'react';
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

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    try {
      await logoutApi();
    } catch {
      // Logout API failure should not prevent local cleanup
    }
    clearAuth();
    window.location.href = '/login?reason=timeout';
  }, [clearAuth]);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);

    if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    if (warningRef.current != null) clearTimeout(warningRef.current);
    if (countdownRef.current != null) clearInterval(countdownRef.current);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(Math.floor(warningMs / 1000));

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
    }, timeoutMs - warningMs);

    // Set logout timer
    timeoutRef.current = setTimeout(handleLogout, timeoutMs);
  }, [timeoutMs, warningMs, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      if (Date.now() - lastActivityRef.current > 1000) {
        resetTimers();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimers();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      if (warningRef.current != null) clearTimeout(warningRef.current);
      if (countdownRef.current != null) clearInterval(countdownRef.current);
    };
  }, [isAuthenticated, resetTimers]);

  return {
    showWarning,
    remainingSeconds,
    extendSession: resetTimers,
    logoutNow: handleLogout,
  };
}
