// src/features/auth/components/login-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks/use-login';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MfaForm } from './mfa-form';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const status = useAuthStore((state) => state.status);
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  if (status === 'mfa-required') {
    return <MfaForm />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h1 className="text-2xl font-bold text-ewb-purple">Sign In</h1>

      {loginMutation.isError && (
        <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          Invalid username or password. Please try again.
        </div>
      )}

      <Input
        label="Username"
        {...register('username')}
        error={errors.username?.message}
        autoComplete="username"
        autoFocus
      />

      <Input
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        autoComplete="current-password"
      />

      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
