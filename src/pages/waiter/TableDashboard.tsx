import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users } from 'lucide-react';
import type { RestaurantTable, TableStatus } from '../../types/index.ts';
import { tableRepository } from '../../repositories/tableRepository.ts';
import { sessionRepository } from '../../repositories/sessionRepository.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';

type TableFilter = 'all' | 'available' | 'occupied';

export default function TableDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
      alert(t.tableDashboard.billingAlert);
    } else if (table.status === 'ready_for_cleaning') {
      if (window.confirm(t.tableDashboard.confirmMark(table.name))) {
        await tableRepository.resetTable(table.id!);
        fetchTables();
      }
    }
  }, [navigate, fetchTables, t]);

  if (loading) return <div className="page-container"><p>{t.common.loading}</p></div>;

  const filteredTables = tables.filter((table) => {
    if (filter === 'all') return true;
    if (filter === 'available') return table.status === 'available';
    return table.status !== 'available';
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.tableDashboard.title}</h1>
          <p className="page-subtitle">{t.tableDashboard.subtitle}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>{t.common.all}</button>
          <button className={`btn ${filter === 'occupied' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('occupied')}>{t.tableDashboard.filterOccupied}</button>
          <button className={`btn ${filter === 'available' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('available')}>{t.tableDashboard.filterAvailable}</button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}><ArrowLeft size={16} />{t.common.back}</button>
        </div>
      </div>

      {tables.length === 0 ? (
        <p>{t.tableDashboard.noTables}</p>
      ) : filteredTables.length === 0 ? (
        <p>{t.tableDashboard.noMatch}</p>
      ) : (
        <div className="table-grid">
          {filteredTables.map((table) => {
            const statusClass = (table.status as string).replace(/_/g, '-').toLowerCase();
            const statusLabel = t.tableStatus[table.status as TableStatus] ?? table.status;
            return (
              <motion.div
                key={table.id}
                className={`card table-tile status-tint-${table.status}`}
                onClick={() => handleTableClick(table)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.22 }}
              >
                <h2>{table.name}</h2>
                <div style={{ marginTop: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
                  <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Users size={14} />
                  {t.common.capacity}: {table.capacity}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
