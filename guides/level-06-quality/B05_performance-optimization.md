# B05 — Performance Optimization

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 6 — Quality

---

## What You Will Learn

By the end of this guide, you will:

- Understand React Compiler and automatic memoization
- Implement route-level code splitting with lazy loading
- Virtualize long lists for transaction history
- Optimize bundle size with tree shaking
- Measure and monitor Web Vitals (LCP, INP, CLS)
- Profile components to find re-render bottlenecks
- Implement image and asset optimization

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A13 — Error Handling | Level 6 |
| Completed B02 — Routing and Navigation | Level 4 |
| Completed A09 — State Management | Level 4 |

> **Note:** Level 6 interleaves A-track and B-track guides: A13 → B05 → A14 → B06. This is intentional — error handling patterns (A13) inform performance optimizations, and both feed into testing (A14) and monitoring (B06).

---

## Phase 1 — React Compiler

### What React Compiler does

React Compiler (formerly React Forget) works with React 19 and automatically
memoizes components, values, and callbacks at build time. It is a **separate
build-time tool** — not bundled with React 19 itself. You must install and
configure it in your Vite/Babel pipeline:

```bash
npm install -D babel-plugin-react-compiler
npm install react-compiler-runtime
```

> The runtime package is a production dependency (imported by compiled output), while the Babel plugin is dev-only.

> See your `vite.config.ts` for the Babel plugin configuration. The compiler
> requires React 19 as the minimum React version but is not included in it.

**Before React Compiler** (React 18 and below):

```tsx
// You had to manually memoize
const MemoizedChild = React.memo(ChildComponent);
const expensiveValue = useMemo(() => compute(data), [data]);
const stableCallback = useCallback(() => handleClick(id), [id]);
```

**With React Compiler** (React 19):

```tsx
// Just write normal code — the compiler optimizes it
function ParentComponent({ data }: { data: Data[] }) {
  const processed = data.filter((item) => item.isActive);

  const handleClick = (id: string) => {
    // ...
  };

  return <ChildComponent items={processed} onClick={handleClick} />;
}
```

The compiler analyzes your code and automatically inserts memoization where it
detects dependencies have not changed. You write clean code; the compiler
handles performance.

### What the compiler does NOT do

The compiler optimizes React-specific patterns. It does not:

- Speed up network requests (use TanStack Query caching)
- Reduce bundle size (use code splitting)
- Optimize DOM updates for large lists (use virtualization)
- Fix slow algorithms (optimize your data processing)

### Rules for the compiler

The compiler relies on React's rules:

1. **Components must be pure** — same props = same output
2. **Hooks must follow the Rules of Hooks** — no conditional hooks
3. **Side effects in useEffect** — not during render

If your code follows these rules (and it should), the compiler works
automatically once installed — no per-component configuration needed.

### Checkpoint 1

A developer asks: "If React Compiler handles memoization, should I remove all
`useMemo` and `useCallback` from our codebase?" What is the correct answer?

Answer: The compiler will handle them, but you can leave existing ones — the
compiler will simply skip optimizing what is already memoized. For new code,
do not add manual `useMemo`/`useCallback`. Let the compiler do its job.

---

## Phase 2 — Code Splitting

### Route-level lazy loading

```tsx
// src/router.tsx
import { createBrowserRouter } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
    lazy: () => import('./layouts/app-layout'),
    children: [
      {
        path: 'dashboard',
        lazy: () => import('./pages/dashboard-page'),
      },
      {
        path: 'accounts',
        lazy: () => import('./pages/accounts-page'),
      },
      {
        path: 'accounts/:id',
        lazy: () => import('./pages/account-detail-page'),
      },
      {
        path: 'transfers',
        lazy: () => import('./pages/transfer-page'),
      },
      {
        path: 'settings',
        lazy: () => import('./pages/settings-page'),
      },
    ],
  },
]);
```

Each `lazy()` import creates a separate chunk. The user only downloads the
JavaScript for the page they are visiting. The dashboard page loads in ~50KB
instead of the full ~300KB bundle.

### Manual code splitting for heavy features

```tsx
// src/features/accounts/components/transaction-chart.tsx
import { lazy, Suspense } from 'react';

const Chart = lazy(() => import('./chart-component'));

export function TransactionChart({ data }: { data: ChartData[] }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100" />}>
      <Chart data={data} />
    </Suspense>
  );
}
```

Use manual `lazy()` for heavy components like charts, PDF viewers, and rich
text editors. These libraries are often 100KB+ and should not be in the
initial bundle.

### Vite chunk strategy

```tsx
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router'],
          'query': ['@tanstack/react-query'],
        },
      },
    },
  },
});
```

Vendor chunks change less frequently than application code. Separating them
allows the browser to cache React and its dependencies independently of your
application updates.

### Checkpoint 2

What is the user experience when they first navigate to a lazy-loaded route?
What does the `Suspense` fallback show? How can you preload routes to eliminate
the loading flash?

---

## Phase 3 — List Virtualization

### The problem with long lists

Banking apps display transaction history — potentially thousands of rows. Without
virtualization, React renders every row in the DOM:

- 1,000 transactions = 1,000 DOM nodes = slow initial render
- Scrolling through 10,000 rows causes jank and high memory usage
- Mobile devices suffer most

### Virtualization with TanStack Virtual

```tsx
// src/features/accounts/components/transaction-list.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height in pixels
    overscan: 10, // Render 10 extra items above/below viewport
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      role="list"
      aria-label="Transaction history"
    >
      <div
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const transaction = transactions[virtualRow.index];
          if (transaction == null) return null;

          return (
            <div
              key={transaction.id}
              role="listitem"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TransactionRow transaction={transaction} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

With virtualization, only ~20 rows are in the DOM at any time, regardless of
the total list size. Scrolling through 10,000 transactions is smooth because
React only manages a fixed number of DOM nodes.

### Checkpoint 3

Why does the virtualizer use `estimateSize` instead of exact heights? What
happens if the estimate is significantly wrong?

---

## Phase 4 — Web Vitals

### Core Web Vitals

| Metric | What It Measures | Target | Impact |
|--------|-----------------|--------|--------|
| **LCP** (Largest Contentful Paint) | Time to render the largest element | < 2.5s | User sees content |
| **INP** (Interaction to Next Paint) | Responsiveness to user input | < 200ms | App feels fast |
| **CLS** (Cumulative Layout Shift) | Unexpected layout movements | < 0.1 | Content does not jump |

### Measuring Web Vitals

```tsx
// src/lib/web-vitals.ts
import { onCLS, onINP, onLCP } from 'web-vitals';
import { env } from './env';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

function reportVital(metric: VitalMetric): void {
  if (import.meta.env.DEV) {
    const color = metric.rating === 'good' ? 'green' : metric.rating === 'poor' ? 'red' : 'orange';
    console.log(`%c[WebVital] ${metric.name}: ${metric.value.toFixed(1)}ms (${metric.rating})`, `color: ${color}`);
  } else {
    navigator.sendBeacon(`${env.VITE_API_BASE_URL}/vitals`, JSON.stringify(metric));
  }
}

export function initWebVitals(): void {
  onCLS((metric) => reportVital({ name: 'CLS', value: metric.value, rating: metric.rating }));
  onINP((metric) => reportVital({ name: 'INP', value: metric.value, rating: metric.rating }));
  onLCP((metric) => reportVital({ name: 'LCP', value: metric.value, rating: metric.rating }));
}
```

```tsx
// src/main.tsx
import { initWebVitals } from '@/lib/web-vitals';
initWebVitals();
```

### Common CLS causes in banking apps

| Cause | Fix |
|-------|-----|
| Loading skeleton wrong size | Match skeleton dimensions to content |
| Images without dimensions | Set width and height on `<img>` |
| Dynamic content insertion | Reserve space with min-height |
| Font swap flash | Use `font-display: swap` with size-adjust |
| Balance loading | Show placeholder with same character width |

---

## Phase 5 — Bundle Analysis

### Analyzing bundle size

```bash
npx vite-bundle-visualizer
```

This generates a treemap showing what is in your bundle. Common issues:

| Issue | Solution |
|-------|----------|
| Full lodash imported | Use `lodash-es` or individual imports |
| Moment.js locales | Use `date-fns` instead |
| Unused icon library | Import individual icons |
| Dev tools in production | Conditional imports behind `import.meta.env.DEV` |

### Tree shaking verification

```tsx
// Good — tree-shakeable
import { format } from 'date-fns';

// Bad — imports everything
import _ from 'lodash';

// Good — tree-shakeable
import debounce from 'lodash-es/debounce';
```

---

## Key Takeaways

1. **React Compiler** auto-memoizes in React 19. Stop writing `useMemo` and
   `useCallback` — just write clean code.

2. **Code splitting** at route level is mandatory. Each page should be a separate
   chunk loaded on demand.

3. **Virtualize long lists** — banking transaction history can have thousands of
   rows. Only render what is visible.

4. **Measure Web Vitals** — LCP < 2.5s, INP < 200ms, CLS < 0.1. Monitor in
   production, not just development.

5. **Analyze your bundle** regularly. One bad import can add 100KB+ to your
   initial load.

---

## Exercises

### Exercise 1 — Prefetch Routes
Implement route prefetching: when the user hovers over a navigation link for
more than 200ms, preload that route's chunk so navigation is instant.

### Exercise 2 — Infinite Scroll
Build an infinite-scroll transaction list that combines TanStack Query
pagination with TanStack Virtual. Load the next page when the user scrolls
near the bottom.

### Exercise 3 — Performance Budget
Set up a performance budget in the Vite config that fails the build if any
chunk exceeds 200KB. Test it by temporarily importing a large library.

---

## What Comes Next

**Next guide:** [A14 — Testing Advanced](A14_testing-advanced.md) —
where you write E2E tests with Playwright, build test data factories,
and achieve meaningful test coverage.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
