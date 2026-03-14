// src/features/auth/components/passkey-enrollment.tsx
import { usePasskeyRegister } from '../hooks/use-passkey-register';
import { usePasskeySupport } from '../hooks/use-passkey-support';
import { Button } from '@/components/ui/button';

export function PasskeyEnrollment() {
  const { isSupported } = usePasskeySupport();
  const register = usePasskeyRegister();

  if (!isSupported) {
    return (
      <div className="rounded bg-amber-50 p-4 text-sm text-amber-800">
        Your browser does not support passkeys. Please use a modern browser
        (Chrome 109+, Safari 16+, Firefox 122+) for enhanced security.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded border p-6">
      <div>
        <h3 className="text-lg font-semibold">Set Up Passkey</h3>
        <p className="mt-1 text-sm text-gray-600">
          Passkeys let you sign in with your fingerprint, face, or device PIN.
          No password needed.
        </p>
      </div>

      {register.isError && (
        <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          Failed to register passkey. Please try again.
        </div>
      )}

      {register.isSuccess && (
        <div role="status" className="rounded bg-green-50 p-3 text-sm text-green-700">
          Passkey registered successfully.
        </div>
      )}

      <Button
        onClick={() => register.mutate()}
        disabled={register.isPending}
      >
        {register.isPending ? 'Setting up...' : 'Add Passkey'}
      </Button>
    </div>
  );
}
