// src/components/layout/app-layout.tsx
import { Outlet } from 'react-router';
import { SidebarNav } from './sidebar-nav';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — dark purple with gold accent */}
      <aside className="flex w-64 flex-col bg-ewb-purple-900 px-4 py-6">
        <div className="mb-8 px-3">
          <h1 className="text-lg font-bold text-white">
            EastWest <span className="text-ewb-gold-300">Bank</span>
          </h1>
          <p className="mt-0.5 text-xs text-ewb-purple-300">Digital Banking</p>
        </div>
        <SidebarNav />
        <div className="mt-auto border-t border-ewb-purple-700 px-3 pt-4">
          <p className="text-xs text-ewb-purple-400">Digital Platforms</p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <span className="text-sm font-medium text-ewb-navy">Banking Portal</span>
        </header>

        <main id="main-content" className="flex-1 px-6 py-8">
          <Outlet />
        </main>

        <footer className="border-t border-gray-200 bg-white px-6 py-3">
          <p className="text-xs text-gray-400">
            EastWest Bank Digital Platforms
          </p>
        </footer>
      </div>
    </div>
  );
}
