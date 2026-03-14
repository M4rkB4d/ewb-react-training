// src/router.tsx
import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { RouteErrorBoundary } from '@/components/error/route-error-boundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, lazy: () => import('@/pages/dashboard') },
      { path: 'accounts', lazy: () => import('@/pages/accounts') },
      { path: 'accounts/:id', lazy: () => import('@/pages/account-detail') },
      { path: 'transfers', lazy: () => import('@/pages/transfers') },
      { path: 'payments', lazy: () => import('@/pages/payments') },
      { path: 'settings', lazy: () => import('@/pages/settings') },
    ],
  },
  { path: '/login', lazy: () => import('@/pages/login') },
  { path: '*', lazy: () => import('@/pages/not-found') },
]);
