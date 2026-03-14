// src/App.tsx
import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { router } from '@/router';
import { useAuthInit } from '@/features/auth/hooks/use-auth-init';
import { useAuthStore } from '@/stores/auth-store';
import { SessionWarningDialog } from '@/components/auth/session-warning-dialog';

function AppInner() {
  useAuthInit();
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div aria-busy="true">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <SessionWarningDialog />
    </>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
