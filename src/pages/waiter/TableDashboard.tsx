import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RestaurantTable } from '../../types/index.ts';
import { TABLE_STATUS_LABELS } from '../../types/index.ts';
import { tableRepository } from '../../repositories/tableRepository.ts';
import { sessionRepository } from '../../repositories/sessionRepository.ts';

const statusColors: Record<string, string> = {
  available: 'badge-success',
  occupied: 'badge-warning',
  order_in_progress: 'badge-warning',
  billing_requested: 'badge-info',
  paid: 'badge-success',
  ready_for_cleaning: 'badge-danger',
};

export default function TableDashboard() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
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
      const sessionId = await sessionRepository.create({
        tableId: table.id!,
        tableName: table.name,
        openedAt: new Date().toISOString(),
        status: 'occupied',
      });
      await tableRepository.updateStatus(table.id!, 'occupied', sessionId);
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

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1>Tables</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back</button>
      </div>

      {tables.length === 0 ? (
        <p>No tables found. Load demo data from the home page.</p>
      ) : (
        <div className="grid">
          {tables.map((table) => (
            <div
              key={table.id}
              className="card"
              style={{ cursor: 'pointer', textAlign: 'center' }}
              onClick={() => handleTableClick(table)}
            >
              <h2 style={{ marginBottom: '0.5rem' }}>{table.name}</h2>
              <span className={`badge ${statusColors[table.status] || ''}`}>
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
