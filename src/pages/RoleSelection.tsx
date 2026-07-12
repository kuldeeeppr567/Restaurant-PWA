import { useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, ChefHat, CircleAlert, Receipt, UtensilsCrossed, Wallet } from 'lucide-react';
import { loadDemoData, resetDemoData } from '../db/seedData.ts';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

interface RoleCard {
  role: string;
  icon: ReactNode;
  description: string;
  path: string;
}

const roles: RoleCard[] = [
  { role: 'Waiter', icon: <UtensilsCrossed size={22} />, description: 'Take orders and serve tables', path: '/waiter/tables' },
  { role: 'Kitchen', icon: <ChefHat size={22} />, description: 'Manage food preparation', path: '/kitchen' },
  { role: 'Cashier', icon: <Wallet size={22} />, description: 'Handle billing and payments', path: '/cashier' },
  { role: 'Owner/Admin', icon: <BarChart3 size={22} />, description: 'Menu management and analytics', path: '/admin/menu' },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(false);

  const handleLoadDemo = useCallback(async () => {
    if (!window.confirm('Load demo data? This will replace all existing data.')) return;
    setLoading(true);
    try {
      await loadDemoData();
      alert('Demo data loaded successfully!');
    } catch (err) {
      alert('Failed to load demo data: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResetDemo = useCallback(async () => {
    if (!window.confirm('Reset all data? This will delete everything.')) return;
    setLoading(true);
    try {
      await resetDemoData();
      alert('All data has been reset.');
    } catch (err) {
      alert('Failed to reset data: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="page-container">
      <div className="role-hero">
        <div className="role-logo"><Receipt size={28} /></div>
        <h1 className="page-title">Restaurant POS</h1>
        <p className="page-subtitle">Premium command center for service, kitchen, and billing workflows</p>
        <p style={{ marginTop: '10px' }}>
          <span className={isOnline ? 'online-indicator' : 'offline-indicator'}>
            {isOnline ? 'Live sync available' : 'Offline mode active'}
          </span>
        </p>
      </div>

      <div className="role-grid">
        {roles.map((r) => (
          <motion.div
            key={r.role}
            className="card role-card"
            onClick={() => navigate(r.path)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(r.path)}
          >
            <div className="role-icon">{r.icon}</div>
            <h2>{r.role}</h2>
            <p className="page-subtitle">{r.description}</p>
          </motion.div>
        ))}
      </div>

      <p className="role-footer">
        <CircleAlert size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
        Demo mode: no authentication enabled.
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={handleLoadDemo} disabled={loading}>
          {loading ? 'Loading...' : 'Load Demo Data'}
        </button>
        <button className="btn btn-secondary" onClick={handleResetDemo} disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Demo Data'}
        </button>
      </div>
    </div>
  );
}
