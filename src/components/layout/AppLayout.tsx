import { type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  ChefHat,
  House,
  LayoutGrid,
  Receipt,
  Settings2,
  UtensilsCrossed,
} from 'lucide-react';
import type { AppRole } from '../../types/index.ts';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.ts';

interface AppLayoutProps {
  children: ReactNode;
  role: AppRole;
}

interface NavItem {
  to: string;
  icon: ReactNode;
  label: string;
}

const navItemsByRole: Record<AppRole, NavItem[]> = {
  waiter: [
    { to: '/waiter/tables', icon: <LayoutGrid size={18} />, label: 'Tables' },
    { to: '/waiter/service', icon: <Bell size={18} />, label: 'Service' },
  ],
  kitchen: [{ to: '/kitchen', icon: <ChefHat size={18} />, label: 'Kitchen Queue' }],
  cashier: [{ to: '/cashier', icon: <Receipt size={18} />, label: 'Billing' }],
  admin: [
    { to: '/admin/menu', icon: <UtensilsCrossed size={18} />, label: 'Menu' },
    { to: '/admin/tables', icon: <LayoutGrid size={18} />, label: 'Tables' },
    { to: '/admin/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
    { to: '/admin/settings', icon: <Settings2 size={18} />, label: 'Settings' },
  ],
};

const roleLabels: Record<AppRole, string> = {
  waiter: 'Waiter Console',
  kitchen: 'Kitchen Console',
  cashier: 'Cashier Console',
  admin: 'Admin Console',
};

export default function AppLayout({ children, role }: AppLayoutProps) {
  const location = useLocation();
  const online = useOnlineStatus();
  const navItems = navItemsByRole[role];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <h2>{roleLabels[role]}</h2>
          </div>
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
          <NavLink to="/">
            <House size={18} />
            Home
          </NavLink>
        </div>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="page-shell"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <NavLink to="/">
          <span className="nav-icon"><House size={18} /></span>
          Home
        </NavLink>
      </nav>
    </div>
  );
}
