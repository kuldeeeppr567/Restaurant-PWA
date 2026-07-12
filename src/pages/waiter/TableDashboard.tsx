import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RestaurantTable } from '../../types/index.ts';
import { TABLE_STATUS_LABELS } from '../../types/index.ts';
import { tableRepository } from '../../repositories/tableRepository.ts';
import { sessionRepository } from '../../repositories/sessionRepository.ts';

const statusColors: Record<string, { bg: string; border: string }> = {
  available: { bg: 'var(--status-available-bg)', border: 'var(--status-available)' },
  occupied: { bg: 'var(--status-occupied-bg)', border: 'var(--status-occupied)' },
  order_in_progress: { bg: 'var(--status-preparing-bg)', border: 'var(--status-preparing)' },
  billing_requested: { bg: 'var(--status-billing-bg)', border: 'var(--status-billing)' },
  paid: { bg: 'var(--status-paid-bg)', border: 'var(--status-paid)' },
  ready_for_cleaning: { bg: 'var(--status-cleaning-bg)', border: 'var(--status-cleaning)' },
};

type TableFilter = 'all' | 'available' | 'occupied';

export default function TableDashboard() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [filter, setFilter] = useState<TableFilter>('all');
  const [loading, setLoading] = useState(true);

  const fetchTables = useCallback(async () => {
    try {
      const allTables = await tableRepository.getAll();
      setTables(allTables);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleTableClick = useCallback(async (table: RestaurantTable) => {
    if (table.status === 'available') {
      const existingSession = await sessionRepository.getByTableId(table.id!);
      if (existingSession?.id) {
        navigate(`/waiter/table/${table.id}`);
        return;
      }

      const sessionId = await sessionRepository.create({
        tableId: table.id!,
        tableName: table.name,
        openedAt: new Date().toISOString(),
        // Keep table available until at least one item is added.
        status: 'available',
      });
      await tableRepository.updateStatus(table.id!, 'available', sessionId);
      navigate(`/waiter/table/${table.id}`);
    } else if (table.status === 'occupied' || table.status === 'order_in_progress') {
      navigate(`/waiter/table/${table.id}`);
    } else if (table.status === 'billing_requested') {
      alert('Billing has been requested for this table.');
    } else if (table.status === 'ready_for_cleaning') {
      if (window.confirm(`Mark ${table.name} as available?`)) {
        await tableRepository.resetTable(table.id!);
        fetchTables();
      }
    }
  }, [navigate, fetchTables]);

  if (loading) {
    return <div className="page-container"><p>Loading tables...</p></div>;
  }

  const filteredTables = tables.filter((table) => {
    if (filter === 'all') return true;
    if (filter === 'available') return table.status === 'available';
    return table.status !== 'available';
  });

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
        <h1>Tables</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`btn ${filter === 'occupied' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('occupied')}>Occupied</button>
          <button className={`btn ${filter === 'available' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('available')}>Available</button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>Back</button>
        </div>
      </div>

      {tables.length === 0 ? (
        <p>No tables found. Load demo data from the home page.</p>
      ) : filteredTables.length === 0 ? (
        <p>No tables match this filter.</p>
      ) : (
        <div className="grid">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="card"
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                background: statusColors[table.status]?.bg ?? 'var(--surface)',
                borderColor: statusColors[table.status]?.border ?? 'var(--border)',
                borderWidth: '2px',
              }}
              onClick={() => handleTableClick(table)}
            >
              <h2 style={{ marginBottom: '0.5rem' }}>{table.name}</h2>
              <span className={`status-badge ${table.status}`}>
                {TABLE_STATUS_LABELS[table.status] || table.status}
              </span>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Capacity: {table.capacity}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
