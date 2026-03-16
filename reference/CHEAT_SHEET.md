# React Enterprise Cheat Sheet

> **EastWest Bank — Digital Platforms & Innovations**

---

## React 19 Essentials

```tsx
// Component with props
function AccountCard({ name, balance }: { name: string; balance: number }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{formatPHP(balance)}</p> {/* balance is in centavos */}
    </div>
  );
}

// State
const [count, setCount] = useState(0);

// Effect
useEffect(() => {
  document.title = `${count} items`;
}, [count]);

// Ref (React 19 — ref is a prop, no forwardRef needed)
function Input({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

**React Compiler (separate build tool):** No manual `useMemo` or `useCallback`
needed when the compiler is installed. It is NOT bundled with React 19 — see B05
for setup.

---

## TypeScript Patterns

```tsx
// Interface for props
interface TransferFormProps {
  accounts: Account[];
  onSubmit: (transfer: TransferRequest) => void;
}

// Discriminated union
type AuthStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: User; accessToken: string }
  | { status: 'mfa-required'; mfaToken: string }
  | { status: 'unauthenticated' };

// Zod schema → TypeScript type
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
});
type LoginData = z.infer<typeof loginSchema>;
```

---

## Zustand 5 (Client State)

```tsx
// Create store
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));

// Use in component
const user = useAuthStore((s) => s.user);
```

---

## TanStack Query 5 (Server State)

```tsx
// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['accounts'],
  queryFn: () => accountsApi.getAll(),
});

// Mutation
const mutation = useMutation({
  mutationFn: (data: TransferRequest) => transfersApi.submit(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  },
});

// Query key factory
export const accountKeys = {
  all: ['accounts'] as const,
  list: () => [...accountKeys.all, 'list'] as const,
  detail: (id: string) => [...accountKeys.all, id] as const,
};
```

---

## React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  amount: z.coerce.number().positive().max(500000), // User enters pesos; convert to centavos (* 100) before API call
  notes: z.string().max(100).optional(),
});

type FormData = z.infer<typeof schema>;

function TransferForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('amount')} />
      {errors.amount && <p>{errors.amount.message}</p>}
    </form>
  );
}
```

---

## React Router 7

```tsx
// Route definitions with lazy loading
const router = createBrowserRouter([
  {
    path: '/',
    lazy: () => import('./layouts/app-layout'),
    children: [
      { path: 'dashboard', lazy: () => import('./pages/dashboard-page') },
      { path: 'accounts/:id', lazy: () => import('./pages/account-detail-page') },
    ],
  },
]);

// Protected route
function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();
  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
```

---

## Axios + Interceptors

```tsx
import { env } from '@/lib/env';

// Create client
const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 refresh interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const { data } = await axios.post(`${env.VITE_API_BASE_URL}/auth/refresh`, null, { withCredentials: true });
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(error.config);
    }
    return Promise.reject(error);
  },
);
```

---

## Testing Quick Reference

```tsx
// Unit test (Vitest)
it('formats peso from centavos', () => {
  expect(formatPHP(123_456)).toBe('₱1,234.56'); // 123456 centavos = ₱1,234.56
});

// Component test (RTL)
render(<AccountCard name="Savings" balance={5_000_000} />); // 5,000,000 centavos = ₱50,000.00
expect(screen.getByText('₱50,000.00')).toBeInTheDocument();

// Hook test
const { result } = renderHook(() => useAuthStore());
act(() => result.current.setUser(createUser()));
expect(result.current.user).not.toBeNull();

// E2E test (Playwright)
await page.goto('/login');
await page.getByLabel('Username').fill('juan.santos');
await page.getByRole('button', { name: 'Sign In' }).click();
await expect(page).toHaveURL('/dashboard');
```

---

## Data Masking

```tsx
maskAccountNumber('1234567890')  // '••••••7890'
maskEmail('juan@ewb.com')        // 'j•••n@ewb.com'
maskPhone('09171234567')         // '•••••••4567'
maskName('Juan Santos')          // 'J••• S•••••'
```

---

## EWB Brand Colors

```
Primary:   #500778 (ewb-purple)
Secondary: #b1006f (ewb-magenta)
Accent:    #dba464 (ewb-gold)
Success:   #d5e04d (ewb-lime)
Info:      #06357A (ewb-navy)
```

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
