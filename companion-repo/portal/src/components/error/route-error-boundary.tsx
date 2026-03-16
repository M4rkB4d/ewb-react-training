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
          <Button className="mt-4" onClick={() => navigate('/')}>
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
      <h1 className="text-2xl font-bold text-error">Something Went Wrong</h1>
      <p className="mt-2 text-gray-600">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <Button className="mt-4" onClick={() => { window.location.reload(); }}>
        Refresh Page
      </Button>
    </div>
  );
}
