import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './error-boundary';

function ThrowingComponent({ error }: { error: Error }) {
  throw error;
}

function GoodComponent() {
  return <p>Everything is fine</p>;
}

describe('ErrorBoundary', () => {
  // Suppress React's error boundary console.error in tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <GoodComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
  });

  it('renders fallback ReactNode when an error occurs', () => {
    render(
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <ThrowingComponent error={new Error('Test error')} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders fallback function with the error', () => {
    render(
      <ErrorBoundary fallback={(err) => <p>Error: {err.message}</p>}>
        <ThrowingComponent error={new Error('Boom!')} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Error: Boom!')).toBeInTheDocument();
  });

  it('calls onError callback with error and component stack', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary fallback={<p>Caught</p>} onError={onError}>
        <ThrowingComponent error={new Error('Crash')} />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Crash' }),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });
});
