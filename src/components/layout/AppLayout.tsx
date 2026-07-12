import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import type { AppRole } from '../../types/index.ts';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.ts';

interface AppLayoutProps {
  children: ReactNode;
  role: AppRole;
}

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const navItemsByRole: Record<AppRole, NavItem[]> = {
  waiter: [
    { to: '/waiter/tables', icon: '🍽️', label: 'Tables' },
    { to: '/waiter/requests', icon: '🔔', label: 'Service Requests' },
  ],
  kitchen: [
    { to: '/kitchen', icon: '👨‍🍳', label: 'Kitchen Queue' },
  ],
  cashier: [
    { to: '/cashier', icon: '💰', label: 'Billing' },
  ],
  admin: [
    { to: '/admin/menu', icon: '📋', label: 'Menu' },
    { to: '/admin/tables', icon: '🪑', label: 'Tables Config' },
    { to: '/admin/analytics', icon: '📊', label: 'Analytics' },
    { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
  ],
};

const roleLabels: Record<AppRole, string> = {
  waiter: 'Waiter',
  kitchen: 'Kitchen',
  cashier: 'Cashier',
  admin: 'Admin',
};

export default function AppLayout({ children, role }: AppLayoutProps) {
  const online = useOnlineStatus();
  const navItems = navItemsByRole[role];

  return (
    <div className="app-layout">
      {/* Sidebar (desktop) */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>{roleLabels[role]}</h2>
          <span className={online ? 'online-indicator' : 'offline-indicator'}>
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/">Change Role</NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">{children}</main>

      {/* Bottom nav (mobile) */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
