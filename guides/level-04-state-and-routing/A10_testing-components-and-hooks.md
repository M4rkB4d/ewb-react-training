# A10 — Testing Components and Hooks

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 4 — State and Routing · Est. 3 hours

---

## What You Will Learn

By the end of this guide, you will:

- Test custom hooks with `renderHook`
- Test Zustand stores in isolation
- Test TanStack Query hooks with MSW for API mocking
- Test components that use routing (MemoryRouter)
- Test form components with React Hook Form
- Write integration tests that combine multiple concerns
- Understand test isolation and cleanup

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A05 — Your First Test | Level 2 |
| Completed A09 — State Management | Level 4 |
| Completed B02 — Routing and Navigation | Level 4 |
| MSW installed | B01 |

---

## Phase 1 — Testing Custom Hooks

### renderHook basics

```tsx
// src/hooks/use-debounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

```tsx
// src/hooks/use-debounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('updates the value after the delay', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } },
    );

    // Change the value
    rerender({ value: 'world', delay: 500 });

    // Not updated yet
    expect(result.current).toBe('hello');

    // Advance time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now updated
    expect(result.current).toBe('world');

    vi.useRealTimers();
  });
});
```

### Checkpoint 1

Write and run the debounce hook test. Understand how `renderHook`, `rerender`, and
`vi.useFakeTimers` work together.

---

## Phase 2 — Testing Zustand Stores

### Store isolation

Zustand stores are singletons. Between tests, reset them to avoid state leaking:

```tsx
// src/stores/auth-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  });

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('sets auth state on login', () => {
    const user = { id: '1', name: 'Juan', email: 'juan@ewb.com', role: 'customer' as const };
    useAuthStore.getState().setAuth(user, 'token-123');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe('token-123');
  });

  it('clears auth state on logout', () => {
    const user = { id: '1', name: 'Juan', email: 'juan@ewb.com', role: 'customer' as const };
    useAuthStore.getState().setAuth(user, 'token-123');
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });
});
```

Zustand stores can be tested without rendering components — `getState()` and
`setState()` let you read and write state directly.

### Checkpoint 2

Test the UI store from A09: toggling sidebar, setting theme, persistence behavior.

---

## Phase 3 — Testing with MSW (API Mocking)

### Setup MSW handlers

```tsx
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

// These URLs must match your app's actual API paths. If apiClient uses
// env.VITE_API_BASE_URL, set that env var in your test setup.
export const handlers = [
  http.get('/api/accounts', () => {
    return HttpResponse.json([
      {
        id: 'acc-1',
        name: 'Personal Savings',
        number: '1234567890', // Note: AccountCard may expect `accountNumber`
        type: 'savings',
        balance: 15_000_000, // ₱150,000.00 in centavos
        currency: 'PHP',
        isActive: true,
      },
      {
        id: 'acc-2',
        name: 'Payroll Checking',
        number: '0987654321',
        type: 'checking',
        balance: 4_250_050, // ₱42,500.50 in centavos
        currency: 'PHP',
        isActive: true,
      },
    ]);
  }),

  http.post('/api/transfers', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'txn-001',
      status: 'completed',
      ...body,
    });
  }),
];
```

### Setup MSW server for tests

```tsx
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```tsx
// src/test/setup.ts (updated)
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Testing a query hook

```tsx
// src/features/accounts/hooks/use-accounts.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect } from 'vitest';
import { useAccounts } from './use-accounts';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useAccounts', () => {
  it('fetches and returns accounts', async () => {
    const { result } = renderHook(() => useAccounts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]?.name).toBe('Personal Savings');
  });
});
```

### Testing error states

```tsx
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

it('handles API errors', async () => {
  // Override the handler for this test only
  server.use(
    http.get('/api/accounts', () => {
      return HttpResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 },
      );
    }),
  );

  const { result } = renderHook(() => useAccounts(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.isError).toBe(true);
  });
});
```

### Checkpoint 3

Write tests for the `useAccounts` hook: successful fetch, error handling, and
data structure validation.

---

## Phase 4 — Testing Components with Routing

### MemoryRouter for test isolation

Components that use `Link`, `NavLink`, or `useNavigate` need a router context:

```tsx
// src/test/test-utils.tsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface RenderOptions {
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={options.initialEntries ?? ['/']}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
```

> **Data Router note:** If your app uses `createBrowserRouter` (from B02), use `createMemoryRouter` with `RouterProvider` instead of `MemoryRouter`. Data router hooks like `useBlocker`, `useMatches`, and `useNavigation` require the data router context.

Usage:

```tsx
import { renderWithProviders } from '@/test/test-utils';

it('renders the accounts page', () => {
  renderWithProviders(<AccountList />, {
    initialEntries: ['/accounts'],
  });

  expect(screen.getByText('My Accounts')).toBeInTheDocument();
});
```

### Checkpoint 4

Write a test that verifies the ProtectedRoute redirects unauthenticated users to
`/login`.

---

## Phase 5 — Testing Forms

### Form submission tests

```tsx
// src/features/auth/components/login-form.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('submits with valid credentials', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('Username'), 'juan.santos');
    await user.type(screen.getByLabelText('Password'), 'SecureP@ss123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(handleSubmit).toHaveBeenCalledWith(
      { username: 'juan.santos', password: 'SecureP@ss123' },
      expect.anything(),
    );
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('Username'), 'juan');
    await user.type(screen.getByLabelText('Password'), 'SecureP@ss123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
  });
});
```

---

## Phase 6 — Integration Test Example

### Testing the full account flow

```tsx
// src/features/accounts/integration.test.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/test-utils';
import { AccountList } from './components/account-list';

describe('Account List Integration', () => {
  it('loads and displays accounts from the API', async () => {
    renderWithProviders(<AccountList />);

    // Shows loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Shows accounts after loading
    await waitFor(() => {
      expect(screen.getByText('Personal Savings')).toBeInTheDocument();
    });

    expect(screen.getByText('Payroll Checking')).toBeInTheDocument();
    expect(screen.getByText('••••7890')).toBeInTheDocument();
  });
});
```

---

## Key Takeaways

1. **`renderHook`** tests hooks in isolation without rendering a component.
2. **Zustand stores** are tested with `getState()` and `setState()` — reset between tests.
3. **MSW** intercepts HTTP requests in tests — mock at the network level, not the
   module level.
4. **`createWrapper`** provides QueryClient context for hooks that use TanStack Query.
5. **`MemoryRouter`** provides routing context in tests without a browser.
6. **Integration tests** combine multiple concerns (API, state, rendering) to verify
   real user workflows.

---

## Exercises

### Exercise 1 — Test the Transfer Mutation
Write tests for `useCreateTransfer`: success case, error case, and optimistic update
rollback.

### Exercise 2 — Test Route Guards
Write tests that verify the ProtectedRoute and RoleGuard components redirect
unauthorized users correctly.

### Exercise 3 — Test the Transfer Wizard
Write integration tests for the multi-step transfer wizard:
steps advance, validation works, review shows correct data.

---

## What Comes Next

Level 4 is complete. You have state management, routing, and comprehensive testing.
Level 5 is the AFASA-critical sprint — API integration, authentication, and passkeys.

**Next guide:** [B03 — API Integration](../level-05-data-and-auth/B03_api-integration.md)

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
