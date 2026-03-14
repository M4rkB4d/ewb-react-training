// src/features/auth/components/passkey-prompt.tsx
import { useState } from 'react';
import { usePasskeyRegister } from '../hooks/use-passkey-register';
import { usePasskeySupport } from '../hooks/use-passkey-support';
import { Button } from '@/components/ui/button';

interface PasskeyPromptProps {
  onDismiss: () => void;
}

export function PasskeyPrompt({ onDismiss }: PasskeyPromptProps) {
  const { isSupported } = usePasskeySupport();
  const register = usePasskeyRegister();
  const [dismissed, setDismissed] = useState(false);

  if (!isSupported || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <div
      role="complementary"
      aria-label="Passkey enrollment suggestion"
      className="rounded-lg border border-ewb-purple/20 bg-ewb-purple/5 p-4"
    >
      <h3 className="font-semibold text-ewb-purple">
        Upgrade to Passkey Sign-In
      </h3>
      <p className="mt-1 text-sm text-gray-700">
        Sign in faster and more securely with your fingerprint or face.
        No more passwords to remember.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          onClick={() => register.mutate()}
          disabled={register.isPending}
        >
          {register.isPending ? 'Setting up...' : 'Set Up Now'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Maybe Later
        </Button>
      </div>
    </div>
  );
}
