// src/pages/login.tsx
import { LoginForm } from '@/features/auth/components/login-form';
import { MfaForm } from '@/features/auth/components/mfa-form';
import { useLogin } from '@/features/auth/hooks/use-login';
import { usePasskeyLogin } from '@/features/auth/hooks/use-passkey-login';
import { usePasskeySupport } from '@/features/auth/hooks/use-passkey-support';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';

export function Component() {
  const status = useAuthStore((s) => s.status);
  const { isSupported } = usePasskeySupport();
  const passkeyLogin = usePasskeyLogin();
  const loginMutation = useLogin();

  const handleLogin = async (data: { username: string; password: string }) => {
    loginMutation.mutate(data);
  };

  if (status === 'mfa-required') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ewb-purple-900 via-ewb-purple to-ewb-navy">
        <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-xl">
          <MfaForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ewb-purple-900 via-ewb-purple to-ewb-navy">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ewb-purple-800">
            EastWest <span className="text-ewb-gold-500">Digital Banking</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        {isSupported && (
          <>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { passkeyLogin.mutate(); }}
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

        <LoginForm onSubmit={handleLogin} isError={loginMutation.isError} />
      </div>
    </div>
  );
}
