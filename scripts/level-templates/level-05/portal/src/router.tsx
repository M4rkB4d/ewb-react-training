// src/router.tsx
import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, lazy: () => import('@/pages/dashboard') },
      { path: 'accounts', lazy: () => import('@/pages/accounts') },
      { path: 'accounts/:id', lazy: () => import('@/pages/account-detail') },
      { path: 'settings', lazy: () => import('@/pages/settings') },
    ],
  },
  { path: '/login', lazy: () => import('@/pages/login') },
  { path: '*', lazy: () => import('@/pages/not-found') },
]);
