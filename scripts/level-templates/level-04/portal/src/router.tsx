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
    ],
  },
  { path: '*', lazy: () => import('@/pages/not-found') },
]);
