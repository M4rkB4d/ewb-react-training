// src/components/auth/session-warning-dialog.tsx
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import { Button } from '@/components/ui/button';

export function SessionWarningDialog() {
  const { showWarning, remainingSeconds, extendSession, logoutNow } =
    useSessionTimeout();

  if (!showWarning) return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="session-title"
      aria-describedby="session-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="rounded-lg bg-white p-6 shadow-xl">
        <h2 id="session-title" className="text-lg font-bold">
          Session Expiring
        </h2>
        <p id="session-desc" className="mt-2 text-gray-600">
          Your session will expire in{' '}
          <span className="font-mono font-bold text-red-600">
            {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
          </span>
          . Would you like to continue?
        </p>
        <div className="mt-4 flex gap-3">
          <Button type="button" onClick={extendSession}>Continue Session</Button>
          <Button type="button" variant="outline" onClick={logoutNow}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
