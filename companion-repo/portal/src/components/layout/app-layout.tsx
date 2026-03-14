// src/components/layout/app-layout.tsx
import { Outlet } from 'react-router';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-ewb-purple px-6 py-4">
        <nav aria-label="Main navigation">
          {/* Navigation links */}
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 px-6 py-4">
        <p className="text-sm text-gray-500">
          EastWest Bank Digital Platforms
        </p>
      </footer>
    </div>
  );
}
