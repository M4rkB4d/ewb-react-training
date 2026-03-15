// src/pages/login-page.tsx
import { LoginForm } from '@/features/auth/components/login-form';
import { usePasskeyLogin } from '@/features/auth/hooks/use-passkey-login';
import { usePasskeySupport } from '@/features/auth/hooks/use-passkey-support';
import { Button } from '@/components/ui/button';

export function Component() {
  const { isSupported } = usePasskeySupport();
  const passkeyLogin = usePasskeyLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ewb-purple">
            EastWest Digital Banking
          </h1>
          <p className="mt-1 text-sm text-gray-600">Sign in to your account</p>
        </div>

        {isSupported && (
          <>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => passkeyLogin.mutate()}
              disabled={passkeyLogin.isPending}
            >
              {passkeyLogin.isPending ? 'Authenticating...' : 'Sign in with Passkey'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>
          </>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
