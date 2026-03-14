// src/pages/not-found.tsx
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function Component() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-ewb-purple">404</h1>
        <p className="mt-4 text-lg text-gray-600">Page not found</p>
        <Link to="/">
          <Button className="mt-6">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
