import { useState, useEffect, useCallback } from 'react';
import type { OrderItem, OrderItemStatus } from '../../types/index.ts';
import { ORDER_STATUS_LABELS } from '../../types/index.ts';
import { orderRepository } from '../../repositories/orderRepository.ts';

type FilterTab = 'all' | 'submitted' | 'preparing' | 'ready';

function timeElapsed(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

const statusBadgeClass: Record<string, string> = {
  submitted: 'badge-warning',
  preparing: 'badge-info',
  ready: 'badge-success',
};

export default function KitchenDisplay() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const queue = await orderRepository.getKitchenQueue();
    queue.sort((a, b) => new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime());
    setItems(queue);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  const handleStatusChange = useCallback(async (itemId: number, newStatus: OrderItemStatus) => {
    await orderRepository.updateStatus(itemId, newStatus);
    fetchItems();
  }, [fetchItems]);

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'submitted', label: 'Pending' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
  ];

  if (loading) return <div className="page-container"><p>Loading kitchen queue...</p></div>;

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1rem' }}>Kitchen Display</h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`btn ${filter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(tab.key)}
            style={{ fontSize: '1.1rem', padding: '0.75rem 1.25rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>No items in queue.</p>
      ) : (
        <div className="grid">
          {filtered.map((item) => (
            <div key={item.id} className="card kitchen-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Table {item.tableId}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {item.itemName}
              </div>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                Qty: <strong>{item.quantity}</strong>
              </div>

              {item.specialInstructions.length > 0 && (
                <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--warning-bg, #fff3cd)', borderRadius: '4px' }}>
                  {item.specialInstructions.map((instr, idx) => (
                    <div key={idx} style={{ fontSize: '1rem', fontWeight: 600 }}>⚠️ {instr}</div>
                  ))}
                </div>
              )}

              {item.customNotes && (
                <div style={{ fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  📝 {item.customNotes}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {timeElapsed(item.orderedAt)}
                </span>
                <span className={`badge ${statusBadgeClass[item.status] || ''}`}>
                  {ORDER_STATUS_LABELS[item.status]}
                </span>
              </div>

              <div style={{ marginTop: '1rem' }}>
                {item.status === 'submitted' && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                    onClick={() => handleStatusChange(item.id!, 'preparing')}
                  >
                    Start Preparing
                  </button>
                )}
                {item.status === 'preparing' && (
                  <button
                    className="btn btn-success"
                    style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                    onClick={() => handleStatusChange(item.id!, 'ready')}
                  >
                    Mark Ready
                  </button>
                )}
                {item.status === 'ready' && (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Waiting for waiter to serve
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
