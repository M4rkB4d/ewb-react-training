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
    <Alert variant="error">
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
