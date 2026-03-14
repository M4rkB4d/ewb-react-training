import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorAlert } from './error-alert';
import { AppError, NetworkError } from '@/lib/errors';

describe('ErrorAlert', () => {
  it('displays a generic message for unknown errors', () => {
    render(<ErrorAlert error={new Error('random')} />);

    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
  });

  it('displays the userMessage for AppError instances', () => {
    const error = new AppError({
      message: 'Internal: DB timeout',
      code: 'DB_TIMEOUT',
      severity: 'high',
      userMessage: 'The server is busy. Please try again in a moment.',
    });

    render(<ErrorAlert error={error} />);

    expect(screen.getByText(/server is busy/i)).toBeInTheDocument();
    // Internal message should NOT be shown to the user
    expect(screen.queryByText(/DB timeout/i)).not.toBeInTheDocument();
  });

  it('shows request ID when available', () => {
    const error = new AppError({
      message: 'Fail',
      code: 'FAIL',
      severity: 'medium',
      userMessage: 'Something failed.',
      context: { requestId: 'req-abc-123' },
    });

    render(<ErrorAlert error={error} />);

    expect(screen.getByText(/req-abc-123/)).toBeInTheDocument();
  });

  it('renders a retry button when onRetry is provided', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(<ErrorAlert error={new NetworkError()} onRetry={onRetry} />);

    const button = screen.getByRole('button', { name: /try again/i });
    await user.click(button);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is absent', () => {
    render(<ErrorAlert error={new Error('oops')} />);

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });
});
