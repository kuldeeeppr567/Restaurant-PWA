import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock3, CookingPot, StickyNote } from 'lucide-react';
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Kitchen Queue</h1>
          <p className="page-subtitle">Track preparation in real time</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button key={tab.key} className={`btn ${filter === tab.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="page-subtitle">No items in queue.</p>
      ) : (
        <div className="kitchen-grid">
          {filtered.map((item) => (
            <motion.div key={item.id} className="card kitchen-card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Table {item.tableId}</h3>
                <span className={`badge ${statusBadgeClass[item.status] || ''}`}>{ORDER_STATUS_LABELS[item.status]}</span>
              </div>

              <p style={{ marginTop: '8px', fontSize: '1.2rem', fontWeight: 600 }}>{item.itemName}</p>
              <p className="page-subtitle">Qty: <strong>{item.quantity}</strong></p>

              {item.specialInstructions.length > 0 && (
                <div className="kitchen-warning">
                  {item.specialInstructions.map((instr, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: idx ? '6px' : 0 }}>
                      <CookingPot size={14} /> {instr}
                    </div>
                  ))}
                </div>
              )}

              {item.customNotes && (
                <div className="kitchen-warning" style={{ background: 'rgba(124, 58, 237, 0.14)', color: '#5b21b6' }}>
                  <StickyNote size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                  {item.customNotes}
                </div>
              )}

              <div className="kitchen-item-meta">
                <span className="page-subtitle" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Clock3 size={14} />{timeElapsed(item.orderedAt)}</span>
              </div>

              <div style={{ marginTop: '14px' }}>
                {item.status === 'submitted' && (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleStatusChange(item.id!, 'preparing')}>
                    Start Preparing
                  </button>
                )}
                {item.status === 'preparing' && (
                  <button className="btn btn-success" style={{ width: '100%' }} onClick={() => handleStatusChange(item.id!, 'ready')}>
                    Mark Ready
                  </button>
                )}
                {item.status === 'ready' && <p className="page-subtitle" style={{ textAlign: 'center' }}>Waiting for waiter to serve</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
