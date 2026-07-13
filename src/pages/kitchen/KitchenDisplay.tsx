import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock3, CookingPot, StickyNote } from 'lucide-react';
import type { OrderItem, OrderItemStatus } from '../../types/index.ts';
import { orderRepository } from '../../repositories/orderRepository.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';
import { timeAgo } from '../../i18n/index.ts';

type FilterTab = 'all' | 'submitted' | 'preparing' | 'ready';

const iconSize = 14;
const tokenSpacing = 'var(--spacing-1)';

const statusBadgeClass: Record<string, string> = {
  submitted: 'badge-warning',
  preparing: 'badge-info',
  ready: 'badge-success',
};

export default function KitchenDisplay() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLanguage();

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
    { key: 'all', label: t.common.all },
    { key: 'submitted', label: t.kitchenDisplay.filterPending },
    { key: 'preparing', label: t.kitchenDisplay.filterPreparing },
    { key: 'ready', label: t.kitchenDisplay.filterReady },
  ];

  if (loading) return <div className="page-container"><p>{t.kitchenDisplay.loadingQueue}</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.kitchenDisplay.title}</h1>
          <p className="page-subtitle">{t.kitchenDisplay.subtitle}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-1)', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button key={tab.key} className={`btn ${filter === tab.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="page-subtitle">{t.kitchenDisplay.noItems}</p>
      ) : (
        <div className="kitchen-grid">
          {filtered.map((item) => (
            <motion.div key={item.id} className="card kitchen-card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{t.kitchenDisplay.tablePrefix} {item.tableId}</h3>
                <span className={`badge ${statusBadgeClass[item.status] || ''}`}>{t.orderStatus[item.status as OrderItemStatus] ?? item.status}</span>
              </div>

              <p style={{ marginTop: 'var(--spacing-1)', fontSize: '1.2rem', fontWeight: 600 }}>{item.itemName}</p>
              <p className="page-subtitle">{t.kitchenDisplay.qty} <strong>{item.quantity}</strong></p>

              {item.specialInstructions.length > 0 && (
                <div className="kitchen-warning">
                  {item.specialInstructions.map((instr, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: tokenSpacing, marginTop: idx ? tokenSpacing : 0 }}>
                      <CookingPot size={iconSize} /> {instr}
                    </div>
                  ))}
                </div>
              )}

              {item.customNotes && (
                <div className="kitchen-warning" style={{ background: 'rgba(124, 58, 237, 0.14)', color: '#5b21b6' }}>
                  <StickyNote size={iconSize} style={{ display: 'inline', marginRight: tokenSpacing, verticalAlign: '-2px' }} />
                  {item.customNotes}
                </div>
              )}

              <div className="kitchen-item-meta">
                <span className="page-subtitle" style={{ display: 'inline-flex', alignItems: 'center', gap: tokenSpacing }}><Clock3 size={iconSize} />{timeAgo(item.orderedAt, lang)}</span>
              </div>

              <div style={{ marginTop: 'var(--spacing-2)' }}>
                {item.status === 'submitted' && (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleStatusChange(item.id!, 'preparing')}>
                    {t.kitchenDisplay.startPreparing}
                  </button>
                )}
                {item.status === 'preparing' && (
                  <button className="btn btn-success" style={{ width: '100%' }} onClick={() => handleStatusChange(item.id!, 'ready')}>
                    {t.kitchenDisplay.markReady}
                  </button>
                )}
                {item.status === 'ready' && <p className="page-subtitle" style={{ textAlign: 'center' }}>{t.kitchenDisplay.waitingForWaiter}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
