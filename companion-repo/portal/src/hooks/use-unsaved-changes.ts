// src/hooks/use-unsaved-changes.ts
import { useEffect } from 'react';
import { useBlocker } from 'react-router';

export function useUnsavedChanges(hasUnsavedChanges: boolean) {
  // Block navigation within the SPA
  const blocker = useBlocker(hasUnsavedChanges);

  // Block browser close/refresh
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => { window.removeEventListener('beforeunload', handleBeforeUnload); };
  }, [hasUnsavedChanges]);

  return blocker;
}
