# B02 — Routing and Navigation

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 4 — State and Routing · Est. 2.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Configure React Router 7 for a single-page banking application
- Implement nested layouts with shared headers and sidebars
- Build route guards for authenticated and role-based routes
- Add lazy loading for route-level code splitting
- Build breadcrumb navigation
- Protect against unsaved form data loss on navigation
- Handle 404 and error routes

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A09 — State Management | Level 4 |
| React Router 7 installed | B01 |
| Auth store from A09 | Level 4 |

---

## Phase 1 — Router Setup

### Create the router

```tsx
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
      { path: 'transfers', lazy: () => import('@/pages/transfers') },
      { path: 'payments', lazy: () => import('@/pages/payments') },
      { path: 'settings', lazy: () => import('@/pages/settings') },
    ],
  },
  { path: '/login', lazy: () => import('@/pages/login') },
  { path: '*', lazy: () => import('@/pages/not-found') },
]);
```

### Mount the router

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient();

const root = document.getElementById('root');
if (root == null) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
```

### Lazy loading explained

The `lazy` property enables route-level code splitting. Each page is loaded only
when the user navigates to it:

```tsx
// src/pages/dashboard.tsx
export function Component() {
  return <h1>Dashboard</h1>;
}

// React Router 7 uses the named export `Component` for lazy routes
```

This keeps the initial bundle small — users only download the code for pages they
visit.

### Checkpoint 1

Set up the router and verify that navigating to `/accounts` loads the accounts page
and `/login` loads the login page.

---

## Phase 2 — Route Guards

### Protecting authenticated routes

```tsx
// src/components/auth/protected-route.tsx
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
```

### Role-based access control

```tsx
// src/components/auth/role-guard.tsx
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';

interface RoleGuardProps {
  allowedRoles: Array<'customer' | 'teller' | 'manager' | 'admin'>;
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (user == null || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

### Using guards in the router

```tsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, lazy: () => import('@/pages/dashboard') },
          { path: 'accounts', lazy: () => import('@/pages/accounts') },
          // Admin-only routes
          {
            element: <RoleGuard allowedRoles={['admin', 'manager']} />,
            children: [
              { path: 'admin', lazy: () => import('@/pages/admin') },
            ],
          },
        ],
      },
    ],
  },
  { path: '/login', lazy: () => import('@/pages/login') },
]);
```

> **BSP 982 Note:** Route guards are a frontend access control mechanism. They
> must always be paired with backend authorization checks. A user who bypasses
> the frontend guard must still be rejected by the API.

### Checkpoint 2

Verify that unauthenticated users are redirected to `/login` and that navigating
back to the original page works after login.

---

## Phase 3 — Navigation Components

### Sidebar navigation

```tsx
// src/components/layout/sidebar-nav.tsx
import { NavLink } from 'react-router';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/accounts', label: 'Accounts', icon: '🏦' },
  { to: '/transfers', label: 'Transfers', icon: '↔️' },
  { to: '/payments', label: 'Payments', icon: '💳' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function SidebarNav() {
  return (
    <nav aria-label="Main navigation">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ewb-purple-100 text-ewb-purple-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

`NavLink` adds an `isActive` state that lets you style the current page differently.
The `end` prop on the root route prevents it from always being active.

### Breadcrumbs

```tsx
// src/components/layout/breadcrumbs.tsx
import { Link, useMatches } from 'react-router';

interface BreadcrumbHandle {
  breadcrumb: string | ((params: Record<string, string>) => string);
}

export function Breadcrumbs() {
  const matches = useMatches();
  const crumbs = matches
    .filter((match) => (match.handle as BreadcrumbHandle)?.breadcrumb != null)
    .map((match) => {
      const handle = match.handle as BreadcrumbHandle;
      const label =
        typeof handle.breadcrumb === 'function'
          ? handle.breadcrumb(match.params as Record<string, string>)
          : handle.breadcrumb;
      return { path: match.pathname, label };
    });

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-gray-500">
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === crumbs.length - 1 ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className="hover:text-ewb-purple">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

### Checkpoint 3

Build the sidebar navigation and breadcrumbs. Verify that the active navigation
item highlights correctly and breadcrumbs update as you navigate.

---

## Phase 4 — Unsaved Changes Protection

### Preventing accidental data loss

When a user is filling out a transfer form and accidentally clicks a navigation
link, they lose their data. Protect against this:

```tsx
// src/hooks/use-unsaved-changes.ts
import { useEffect } from 'react';
import { useBlocker } from 'react-router';

export function useUnsavedChanges(hasUnsavedChanges: boolean) {
  // Block navigation within the SPA
  const blocker = useBlocker(hasUnsavedChanges);

  // Block browser close/refresh
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return blocker;
}
```

Usage in a form:

```tsx
export function TransferPage() {
  const { formState: { isDirty } } = useForm();
  const blocker = useUnsavedChanges(isDirty);

  return (
    <>
      <form>{/* ... */}</form>

      {blocker.state === 'blocked' && (
        <ConfirmationDialog
          isOpen={true}
          title="Unsaved Changes"
          message="You have unsaved changes. Are you sure you want to leave?"
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}
    </>
  );
}
```

### Checkpoint 4

Add unsaved changes protection to the transfer wizard. Verify that:
1. Navigating away with a filled form shows a confirmation dialog
2. Clicking "Stay" keeps the user on the page with form data intact
3. Clicking "Leave" navigates away

---

## Phase 5 — Error and 404 Pages

### Not Found page

```tsx
// src/pages/not-found.tsx
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function Component() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-ewb-purple">404</h1>
        <p className="mt-4 text-lg text-gray-600">Page not found</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-ewb-purple px-6 py-2 text-white hover:bg-ewb-purple-700"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
```

### Route error boundary

```tsx
// src/components/error/route-error-boundary.tsx
import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">{error.status}</h1>
          <p className="mt-2 text-gray-600">{error.statusText}</p>
          <Link to="/" className="mt-4 inline-flex items-center justify-center rounded-lg bg-ewb-purple px-4 py-2 text-white hover:bg-ewb-purple-700">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Something went wrong</h1>
        <p className="mt-2 text-gray-600">An unexpected error occurred.</p>
        <Link to="/" className="mt-4 inline-flex items-center justify-center rounded-lg bg-ewb-purple px-4 py-2 text-white hover:bg-ewb-purple-700">Go Home</Link>
      </div>
    </div>
  );
}
```

---

## Key Takeaways

1. **Lazy loading** splits code by route. Users only download the pages they visit.
2. **Route guards** protect authenticated and role-based routes. Always pair with
   backend authorization.
3. **NavLink** provides `isActive` state for highlighting current navigation.
4. **Breadcrumbs** improve navigation context using route handle metadata.
5. **Unsaved changes protection** prevents accidental data loss in forms.
6. **Error boundaries** at the route level catch rendering errors gracefully.

---

## Exercises

### Exercise 1 — Nested Account Routes
Set up nested routes: `/accounts` (list), `/accounts/:id` (detail),
`/accounts/:id/transactions` (transactions).

### Exercise 2 — Session Timeout Redirect
Build a hook that detects when the auth token expires and redirects to `/login`
with a message "Your session has expired."

### Exercise 3 — Route Transition Loading
Show a loading indicator in the header during route transitions using
`useNavigation()` from React Router.

---

## What Comes Next

**Next guide:** [A10 — Testing Components and Hooks](A10_testing-components-and-hooks.md)
— where you test stores, queries, forms, and routing.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
