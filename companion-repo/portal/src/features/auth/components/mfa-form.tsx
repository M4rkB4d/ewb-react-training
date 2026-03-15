// src/features/auth/components/mfa-form.tsx
import { useState, useRef, useEffect } from 'react';
import { useVerifyMfa } from '../hooks/use-verify-mfa';
import { Button } from '@/components/ui/button';

export function MfaForm() {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const verifyMfa = useVerifyMfa();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length === 6) {
      verifyMfa.mutate(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Verification Required</h2>
      <p className="text-sm text-gray-600">
        Enter the 6-digit code from your authenticator app.
      </p>

      {verifyMfa.isError && (
        <div role="alert" className="rounded bg-error/10 p-3 text-sm text-error">
          Invalid code. Please try again.
        </div>
      )}

      <div>
        <label htmlFor="mfa-code" className="sr-only">Verification code</label>
        <input
          id="mfa-code"
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{6}"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className="w-full rounded border p-3 text-center text-2xl tracking-widest"
          aria-describedby="mfa-help"
        />
        <p id="mfa-help" className="mt-1 text-xs text-gray-500">
          6-digit verification code
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={code.length !== 6 || verifyMfa.isPending}
      >
        {verifyMfa.isPending ? 'Verifying...' : 'Verify'}
      </Button>
    </form>
  );
}
