// src/components/layout/sidebar-nav.tsx
import { NavLink } from 'react-router';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '\u{1F4CA}' },
  { to: '/accounts', label: 'Accounts', icon: '\u{1F3E6}' },
  { to: '/transfers', label: 'Transfers', icon: '\u{2194}\u{FE0F}' },
  { to: '/payments', label: 'Payments', icon: '\u{1F4B3}' },
  { to: '/settings', label: 'Settings', icon: '\u{2699}\u{FE0F}' },
];

export function SidebarNav() {
  return (
    <nav aria-label="Main navigation">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ewb-purple-700 text-ewb-gold-300'
                    : 'text-ewb-purple-100 hover:bg-ewb-purple-800 hover:text-white'
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
