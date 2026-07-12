import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users } from 'lucide-react';
import type { RestaurantTable } from '../../types/index.ts';
import { TABLE_STATUS_LABELS } from '../../types/index.ts';
import { tableRepository } from '../../repositories/tableRepository.ts';
import { sessionRepository } from '../../repositories/sessionRepository.ts';

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

  if (loading) return <div className="page-container"><p>Loading tables...</p></div>;

  const filteredTables = tables.filter((table) => {
    if (filter === 'all') return true;
    if (filter === 'available') return table.status === 'available';
    return table.status !== 'available';
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tables</h1>
          <p className="page-subtitle">Select a table to continue service workflow</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`btn ${filter === 'occupied' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('occupied')}>Occupied</button>
          <button className={`btn ${filter === 'available' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('available')}>Available</button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}><ArrowLeft size={16} />Back</button>
        </div>
      </div>

      {tables.length === 0 ? (
        <p>No tables found. Load demo data from the home page.</p>
      ) : filteredTables.length === 0 ? (
        <p>No tables match this filter.</p>
      ) : (
        <div className="table-grid">
          {filteredTables.map((table) => (
            <motion.div
              key={table.id}
              className={`card table-tile status-tint-${table.status}`}
              onClick={() => handleTableClick(table)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <h2>{table.name}</h2>
              <span className={`status-badge ${table.status}`}>{TABLE_STATUS_LABELS[table.status] || table.status}</span>
              <p className="page-subtitle" style={{ marginTop: 'var(--spacing-1)', display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
                <Users size={16} /> Capacity: {table.capacity}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
