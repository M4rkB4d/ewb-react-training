// src/components/offline-banner.tsx
import { useOnlineStatus } from '@/hooks/use-online-status';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="bg-yellow-100 px-4 py-2 text-center text-sm text-yellow-800"
      role="alert"
    >
      You are offline. Some features may be unavailable. Data will sync when
      your connection is restored.
    </div>
  );
}
