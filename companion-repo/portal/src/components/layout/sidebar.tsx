// src/components/layout/sidebar.tsx
import { useUIStore } from '@/stores/ui-store';

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 border-r bg-white p-4">
      <nav aria-label="Sidebar navigation">
        {/* Navigation items */}
      </nav>
    </aside>
  );
}
