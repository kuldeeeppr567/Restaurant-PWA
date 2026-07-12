import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDemoData, resetDemoData } from '../db/seedData.ts';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

interface RoleCard {
  role: string;
  icon: string;
  description: string;
  path: string;
}

const roles: RoleCard[] = [
  { role: 'Waiter', icon: '🍽️', description: 'Take orders and serve tables', path: '/waiter/tables' },
  { role: 'Kitchen', icon: '👨‍🍳', description: 'Manage food preparation', path: '/kitchen' },
  { role: 'Cashier', icon: '💰', description: 'Handle billing and payments', path: '/cashier' },
  { role: 'Owner/Admin', icon: '📊', description: 'Menu management and analytics', path: '/admin/menu' },
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
    <div className="page-container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
        🫓 Dosa Restaurant POS
      </h1>

      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        {isOnline ? '🟢 Online' : '🔴 Offline'}
      </p>

      <div className="grid" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
        {roles.map((r) => (
          <div
            key={r.role}
            className="card"
            style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }}
            onClick={() => navigate(r.path)}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{r.icon}</div>
            <h2 style={{ marginBottom: '0.25rem' }}>{r.role}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r.description}</p>
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--warning)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        ⚠️ Demo Mode - No authentication. Select a role to continue.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
