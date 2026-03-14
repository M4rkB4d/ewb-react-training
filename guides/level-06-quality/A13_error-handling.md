# A13 — Error Handling

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 6 — Quality · Est. 3 hours

---

## What You Will Learn

By the end of this guide, you will:

- Classify errors by type and severity
- Build a custom error taxonomy for banking apps
- Implement React error boundaries at multiple levels
- Create structured error logging for BSP audit trails
- Handle async errors in hooks and event handlers
- Build user-facing error messages that are helpful without leaking details
- Design fallback UIs for critical failures

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed B03 — API Integration | Level 5 |
| Completed A10 — Testing Components and Hooks | Level 4 |

---

## Phase 1 — Error Taxonomy

### Classifying errors

Not all errors are equal. In banking, the error type determines the response:

| Category | Examples | User Impact | Action |
|----------|----------|------------|--------|
| **Validation** | Invalid amount, wrong format | Immediate feedback | Show field error |
| **Network** | No internet, timeout | Retry or wait | Show retry option |
| **Auth** | Token expired, unauthorized | Session interrupted | Redirect to login |
| **Business Logic** | Insufficient funds, daily limit | Transaction blocked | Show specific message |
| **Server** | 500 error, service down | Degraded experience | Show fallback UI |
| **Client** | Render crash, undefined access | Feature broken | Error boundary catches |
| **Security** | Tampered data, CSP violation | Potential attack | Log and block |

### Custom error classes

```tsx
// src/lib/errors.ts

export class AppError extends Error {
  readonly code: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly userMessage: string;
  readonly context?: Record<string, unknown>;

  constructor(options: {
    message: string;
    code: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userMessage: string;
    context?: Record<string, unknown>;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = 'AppError';
    this.code = options.code;
    this.severity = options.severity;
    this.userMessage = options.userMessage;
    this.context = options.context;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      message,
      code: 'VALIDATION_ERROR',
      severity: 'low',
      userMessage: message,
      context,
    });
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(cause?: unknown) {
    super({
      message: 'Network request failed',
      code: 'NETWORK_ERROR',
      severity: 'medium',
      userMessage: 'Unable to connect. Please check your internet connection and try again.',
      cause,
    });
    this.name = 'NetworkError';
  }
}

export class BusinessError extends AppError {
  constructor(message: string, userMessage: string, context?: Record<string, unknown>) {
    super({
      message,
      code: 'BUSINESS_ERROR',
      severity: 'medium',
      userMessage,
      context,
    });
    this.name = 'BusinessError';
  }
}

export class SecurityError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      message,
      code: 'SECURITY_ERROR',
      severity: 'critical',
      userMessage: 'A security issue was detected. Please contact support.',
      context,
    });
    this.name = 'SecurityError';
  }
}
```

### Checkpoint 1

Why does `SecurityError` have a generic `userMessage` that does not reveal the
actual error? What could an attacker learn from a detailed security error message?

---

## Phase 2 — Error Boundaries

### Route-level error boundary

```tsx
// src/components/error/route-error-boundary.tsx
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
          <p className="mt-2 text-gray-600">
            The page you are looking for does not exist.
          </p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900">{error.status}</h1>
        <p className="mt-2 text-gray-600">{error.statusText}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center" role="alert">
      <h1 className="text-2xl font-bold text-red-700">Something Went Wrong</h1>
      <p className="mt-2 text-gray-600">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <Button className="mt-4" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  );
}
```

### Component-level error boundary

```tsx
// src/components/error/error-boundary.tsx
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // BSP 1019 — Log errors for monitoring
    console.error('[ErrorBoundary]', error, errorInfo.componentStack);
    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error != null) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error);
      }
      return (
        <>
          {this.props.fallback}
          <button onClick={this.resetError}>Try Again</button>
        </>
      );
    }
    return this.props.children;
  }
}
```

Error boundaries are the one case where class components are still required in
React — the `getDerivedStateFromError` and `componentDidCatch` lifecycle methods
have no hook equivalents.

> **Practical alternative:** The [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary)
> library wraps this class component boilerplate into a declarative API with
> `<ErrorBoundary fallbackRender={...} onReset={...} />`. It adds retry/reset
> support, `useErrorBoundary()` for programmatic error throwing, and eliminates
> the need to write class components yourself. In production projects, prefer
> `react-error-boundary` over hand-rolling the class above — the implementation
> shown here is for understanding what happens under the hood.

### Using error boundaries

```tsx
// src/app.tsx (error boundary placement)
<ErrorBoundary
  fallback={<FullPageError />}
  onError={(error, info) => {
    // Send to monitoring (Sentry, Azure App Insights)
    logError(error, { componentStack: info.componentStack });
  }}
>
  <RouterProvider router={router} />
</ErrorBoundary>
```

```tsx
// Feature-level boundary
<ErrorBoundary
  fallback={<div className="p-4 text-red-600">Failed to load account details.</div>}
>
  <AccountDetails id={accountId} />
</ErrorBoundary>
```

### Checkpoint 2

Error boundaries only catch errors during rendering, lifecycle methods, and
constructors. They do NOT catch errors in event handlers or async code.
How do you handle errors in a `onClick` handler?

---

## Phase 3 — Structured Error Logging

### Error logger

```tsx
// src/lib/error-logger.ts
import { AppError } from './errors';

interface ErrorLogEntry {
  timestamp: string;
  code: string;
  message: string;
  severity: string;
  context?: Record<string, unknown>;
  componentStack?: string;
  url: string;
  userId?: string;
}

export function logError(error: unknown, extra?: { componentStack?: string }): void {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    code: error instanceof AppError ? error.code : 'UNKNOWN',
    message: error instanceof Error ? error.message : String(error),
    severity: error instanceof AppError ? error.severity : 'high',
    context: error instanceof AppError ? error.context : undefined,
    componentStack: extra?.componentStack,
    url: window.location.href,
  };

  // In production: send to monitoring service
  // In development: log to console
  if (import.meta.env.DEV) {
    console.error('[ErrorLog]', entry);
  } else {
    // Send to Sentry / Azure App Insights (covered in B06)
    navigator.sendBeacon('/api/errors', JSON.stringify(entry));
  }
}
```

`navigator.sendBeacon` is used for error reporting because it is guaranteed to
send the data even if the page is unloading (user closing the tab after an error).

### Global error handlers

```tsx
// src/lib/global-error-handlers.ts
import { logError } from './error-logger';

export function setupGlobalErrorHandlers(): void {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason);
    if (import.meta.env.PROD) {
      event.preventDefault(); // Suppress console noise in production only
    }
  });

  // Catch uncaught errors
  window.addEventListener('error', (event) => {
    logError(event.error ?? event.message);
  });
}
```

```tsx
// src/main.tsx
import { setupGlobalErrorHandlers } from '@/lib/global-error-handlers';

setupGlobalErrorHandlers();
// ... rest of app initialization
```

---

## Phase 4 — User-Facing Error Messages

### Error message principles

| Principle | Bad | Good |
|-----------|-----|------|
| Be specific | "An error occurred" | "Unable to load your account balance" |
| Suggest action | "Error 500" | "Please try again in a few moments" |
| No technical jargon | "TypeError: Cannot read property 'id' of null" | "Something went wrong loading your data" |
| No sensitive data | "SQL error: table users column password" | "A system error occurred. Reference: REQ-abc123" |
| Provide reference | (no reference) | "If the problem persists, contact support with reference REQ-abc123" |

### Error display components

```tsx
// src/components/error/error-alert.tsx
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AppError } from '@/lib/errors';

interface ErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  const message = error instanceof AppError
    ? error.userMessage
    : 'An unexpected error occurred. Please try again.';

  const requestId = error instanceof AppError ? error.context?.requestId : undefined;

  return (
    <Alert variant="destructive" role="alert">
      <p>{message}</p>
      {requestId != null && (
        <p className="mt-1 text-xs opacity-75">Reference: {String(requestId)}</p>
      )}
      {onRetry != null && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Alert>
  );
}
```

---

## Key Takeaways

1. **Classify errors by type** — validation, network, auth, business logic,
   server, client, security. Each type gets different treatment.

2. **Custom error classes** carry structured data — code, severity, user message,
   and context. Never show raw error messages to users.

3. **Error boundaries** catch rendering errors. Place them at route level (full
   page fallback) and feature level (graceful degradation).

4. **Structured logging** (BSP 1019) records every error with timestamp, code,
   severity, user context, and URL for audit and debugging.

5. **User messages** must be helpful without leaking technical or security details.
   Always provide a reference ID for support follow-up.

6. **`navigator.sendBeacon`** ensures error reports are sent even during page
   unload.

---

## Exercises

### Exercise 1 — Error Recovery
Build a `RetryableQuery` wrapper component that catches TanStack Query errors
and shows a retry button with exponential backoff feedback ("Retrying in 3s...").

### Exercise 2 — Error Dashboard
Build a development-only `ErrorLog` component that shows the last 20 logged
errors in a floating panel. Include timestamp, code, severity badge, and message.

### Exercise 3 — Business Error Handling
Handle these banking business errors with appropriate user messages:
- Insufficient funds (show current balance vs requested amount)
- Daily transfer limit exceeded (show limit and today's total)
- Account frozen (direct to branch)

---

## What Comes Next

**Next guide:** [B05 — Performance Optimization](B05_performance-optimization.md) —
where you optimize rendering with React Compiler, implement code splitting,
virtualize long lists, and measure Web Vitals.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
