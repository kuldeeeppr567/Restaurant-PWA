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
import { useLanguage } from '../../hooks/useLanguage.ts';

interface AppLayoutProps {
  children: ReactNode;
  role: AppRole;
}

const navIconsByRole: Record<AppRole, ReactNode[]> = {
  waiter: [<LayoutGrid size={18} />, <Bell size={18} />],
  kitchen: [<ChefHat size={18} />],
  cashier: [<Receipt size={18} />],
  admin: [
    <UtensilsCrossed size={18} />,
    <LayoutGrid size={18} />,
    <BarChart3 size={18} />,
    <Settings2 size={18} />,
  ],
};

const navPathsByRole: Record<AppRole, string[]> = {
  waiter: ['/waiter/tables', '/waiter/service'],
  kitchen: ['/kitchen'],
  cashier: ['/cashier'],
  admin: ['/admin/menu', '/admin/tables', '/admin/analytics', '/admin/settings'],
};

export default function AppLayout({ children, role }: AppLayoutProps) {
  const location = useLocation();
  const online = useOnlineStatus();
  const { t } = useLanguage();

  const roleLabel = t.appLayout.roleLabels[role];
  const navLabels = t.appLayout.navItems[role].map((item) => item.label);
  const navIcons = navIconsByRole[role];
  const navPaths = navPathsByRole[role];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <h2>{roleLabel}</h2>
          </div>
          <span className={online ? 'online-indicator' : 'offline-indicator'}>
            {online ? t.common.online : t.common.offline}
          </span>
        </div>

        <nav className="sidebar-nav">
          {navPaths.map((path, idx) => (
            <NavLink key={path} to={path}>
              <span className="nav-icon">{navIcons[idx]}</span>
              {navLabels[idx]}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/">
            <House size={18} />
            {t.common.home}
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
        {navPaths.map((path, idx) => (
          <NavLink key={path} to={path}>
            <span className="nav-icon">{navIcons[idx]}</span>
            {navLabels[idx]}
          </NavLink>
        ))}
        <NavLink to="/">
          <span className="nav-icon"><House size={18} /></span>
          {t.common.home}
        </NavLink>
      </nav>
    </div>
  );
}
