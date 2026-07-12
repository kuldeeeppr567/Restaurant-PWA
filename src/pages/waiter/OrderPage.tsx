import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { RestaurantTable, MenuItem, OrderItem, OrderItemStatus } from '../../types/index.ts';
import { SPECIAL_INSTRUCTIONS, ORDER_STATUS_LABELS } from '../../types/index.ts';
import { tableRepository } from '../../repositories/tableRepository.ts';
import { sessionRepository } from '../../repositories/sessionRepository.ts';
import { menuRepository } from '../../repositories/menuRepository.ts';
import { orderRepository } from '../../repositories/orderRepository.ts';

interface DraftItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions: string[];
  customNotes: string;
}

function splitCategory(category: string): { broad: string; sub: string } {
  const [broad, ...rest] = category.split('>').map((part) => part.trim()).filter(Boolean);
  if (!broad) return { broad: 'Other', sub: 'General' };
  if (rest.length === 0) return { broad, sub: 'General' };
  return { broad, sub: rest.join(' > ') };
}

export default function OrderPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const [table, setTable] = useState<RestaurantTable | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Menu picker state
  const [showPicker, setShowPicker] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categoryTree, setCategoryTree] = useState<Record<string, string[]>>({});
  const [selectedBroadCategory, setSelectedBroadCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);

  const syncTableStatusWithItems = useCallback(async (items: OrderItem[]) => {
    if (!table?.id || !sessionId) return;
    const activeItems = items.filter((item) => item.status !== 'cancelled');
    if (activeItems.length === 0) {
      await tableRepository.updateStatus(table.id, 'available', sessionId);
      await sessionRepository.update(sessionId, { status: 'available' });
      return;
    }

    if (table.status === 'available') {
      await tableRepository.updateStatus(table.id, 'occupied', sessionId);
      await sessionRepository.update(sessionId, { status: 'occupied' });
    }
  }, [table, sessionId]);

  const fetchData = useCallback(async () => {
    if (!tableId) return;
    const tid = parseInt(tableId, 10);
    const t = await tableRepository.getById(tid);
    setTable(t ?? null);

    if (t) {
      const session = await sessionRepository.getByTableId(tid);
      if (session?.id) {
        setSessionId(session.id);
        const items = await orderRepository.getBySessionId(session.id);
        setOrderItems(items);
      }
    }
    setLoading(false);
  }, [tableId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openPicker = useCallback(async () => {
    const available = await menuRepository.getAvailable();
    const tree = available.reduce<Record<string, Set<string>>>((acc, item) => {
      const { broad, sub } = splitCategory(item.category);
      if (!acc[broad]) acc[broad] = new Set<string>();
      acc[broad].add(sub);
      return acc;
    }, {});

    const normalizedTree = Object.fromEntries(
      Object.entries(tree)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([broad, subs]) => [broad, Array.from(subs).sort((a, b) => a.localeCompare(b))])
    );
    const firstBroad = Object.keys(normalizedTree)[0] || '';
    const firstSub = normalizedTree[firstBroad]?.[0] || '';

    setMenuItems(available);
    setCategoryTree(normalizedTree);
    setSelectedBroadCategory(firstBroad);
    setSelectedSubCategory(firstSub);
    setDraftItems([]);
    setShowPicker(true);
  }, []);

  const updateDraftItem = useCallback((menuItem: MenuItem, quantityDelta: number) => {
    setDraftItems((prev) => {
      const existing = prev.find((d) => d.menuItem.id === menuItem.id);
      if (existing) {
        const newQty = existing.quantity + quantityDelta;
        if (newQty <= 0) return prev.filter((d) => d.menuItem.id !== menuItem.id);
        return prev.map((d) => d.menuItem.id === menuItem.id ? { ...d, quantity: newQty } : d);
      }
      if (quantityDelta > 0) {
        return [...prev, { menuItem, quantity: quantityDelta, specialInstructions: [], customNotes: '' }];
      }
      return prev;
    });
  }, []);

  const toggleInstruction = useCallback((menuItemId: number, instruction: string) => {
    setDraftItems((prev) =>
      prev.map((d) => {
        if (d.menuItem.id !== menuItemId) return d;
        const has = d.specialInstructions.includes(instruction);
        return {
          ...d,
          specialInstructions: has
            ? d.specialInstructions.filter((i) => i !== instruction)
            : [...d.specialInstructions, instruction],
        };
      })
    );
  }, []);

  const setCustomNotes = useCallback((menuItemId: number, notes: string) => {
    setDraftItems((prev) =>
      prev.map((d) => d.menuItem.id === menuItemId ? { ...d, customNotes: notes } : d)
    );
  }, []);

  const addToOrder = useCallback(async () => {
    if (!sessionId || draftItems.length === 0) return;
    const now = new Date().toISOString();
    const items = draftItems.map((draft) => ({
      sessionId,
      tableId: parseInt(tableId!, 10),
      menuItemId: draft.menuItem.id!,
      itemName: draft.menuItem.name,
      priceSnapshot: draft.menuItem.price,
      quantity: draft.quantity,
      specialInstructions: draft.specialInstructions,
      customNotes: draft.customNotes,
      status: 'draft' as const,
      orderedAt: now,
    }));
    await orderRepository.bulkCreate(items);
    if (table?.id) {
      await tableRepository.updateStatus(table.id, 'occupied', sessionId);
      await sessionRepository.update(sessionId, { status: 'occupied' });
    }
    setShowPicker(false);
    setDraftItems([]);
    fetchData();
  }, [sessionId, tableId, draftItems, table, fetchData]);

  const submitToKitchen = useCallback(async () => {
    const drafts = orderItems.filter((i) => i.status === 'draft');
    for (const item of drafts) {
      await orderRepository.updateStatus(item.id!, 'submitted');
    }
    if (table) {
      await tableRepository.updateStatus(table.id!, 'order_in_progress', sessionId ?? undefined);
    }
    fetchData();
  }, [orderItems, table, sessionId, fetchData]);

  const markServed = useCallback(async (itemId: number) => {
    await orderRepository.updateStatus(itemId, 'served');
    fetchData();
  }, [fetchData]);

  const removeOrderItem = useCallback(async (itemId: number) => {
    if (!sessionId) return;
    await orderRepository.remove(itemId);
    const updatedItems = await orderRepository.getBySessionId(sessionId);
    await syncTableStatusWithItems(updatedItems);
    await fetchData();
  }, [sessionId, syncTableStatusWithItems, fetchData]);

  const requestBilling = useCallback(async () => {
    if (!table || !sessionId) return;
    await tableRepository.updateStatus(table.id!, 'billing_requested', sessionId);
    await sessionRepository.update(sessionId, { status: 'billing_requested' });
    fetchData();
  }, [table, sessionId, fetchData]);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;
  if (!table) return <div className="page-container"><p>Table not found.</p></div>;

  const grouped = orderItems.reduce<Record<OrderItemStatus, OrderItem[]>>((acc, item) => {
    if (!acc[item.status]) acc[item.status] = [];
    acc[item.status].push(item);
    return acc;
  }, {} as Record<OrderItemStatus, OrderItem[]>);

  const statusOrder: OrderItemStatus[] = ['draft', 'submitted', 'preparing', 'ready', 'served'];
  const filteredMenuItems = menuItems.filter((menuItem) => {
    const { broad, sub } = splitCategory(menuItem.category);
    return broad === selectedBroadCategory && sub === selectedSubCategory;
  });

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1>{table.name} - Order</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/waiter/tables')}>Back</button>
      </div>

      {/* Existing order items */}
      {orderItems.length === 0 && !showPicker && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No items yet. Add items to get started.</p>
      )}

      {statusOrder.map((status) => {
        const items = grouped[status];
        if (!items || items.length === 0) return null;
        return (
          <div key={status} style={{ marginBottom: '1rem' }}>
            <h3>{ORDER_STATUS_LABELS[status]} ({items.length})</h3>
            {items.map((item) => (
              <div key={item.id} className="card" style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{item.itemName}</strong> x{item.quantity}
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                    ₹{item.priceSnapshot * item.quantity}
                  </span>
                  {item.specialInstructions.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>
                      {item.specialInstructions.join(', ')}
                    </div>
                  )}
                  {item.customNotes && (
                    <div style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>{item.customNotes}</div>
                  )}
                </div>
                {item.status === 'ready' && (
                  <button className="btn btn-primary" onClick={() => markServed(item.id!)}>Mark Served</button>
                )}
                {item.status === 'draft' && (
                  <button className="btn btn-danger" onClick={() => removeOrderItem(item.id!)}>Remove</button>
                )}
              </div>
            ))}
          </div>
        );
      })}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={openPicker}>Add Items</button>
        {orderItems.some((i) => i.status === 'draft') && (
          <button className="btn btn-success" onClick={submitToKitchen}>Submit to Kitchen</button>
        )}
        {orderItems.length > 0 && table.status !== 'billing_requested' && (
          <button className="btn btn-warning" onClick={requestBilling}>Request Billing</button>
        )}
      </div>

      {/* Menu picker modal */}
      {showPicker && (
        <div style={{ border: '2px solid var(--border)', borderRadius: '8px', padding: '1rem', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Select Items</h2>
            <button className="btn btn-secondary" onClick={() => setShowPicker(false)}>Close</button>
          </div>

          {/* Category selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <select
              value={selectedBroadCategory}
              onChange={(e) => {
                const nextBroad = e.target.value;
                setSelectedBroadCategory(nextBroad);
                setSelectedSubCategory(categoryTree[nextBroad]?.[0] || '');
              }}
              className="input"
            >
              {Object.keys(categoryTree).map((broad) => (
                <option key={broad} value={broad}>
                  {broad}
                </option>
              ))}
            </select>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              className="input"
            >
              {(categoryTree[selectedBroadCategory] || []).map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Menu items */}
          {filteredMenuItems.map((item) => {
            const draft = draftItems.find((d) => d.menuItem.id === item.id);
            return (
              <div key={item.id} className="card" style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{item.name}</strong>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>₹{item.price}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn btn-secondary" onClick={() => updateDraftItem(item, -1)}>-</button>
                    <span style={{ minWidth: '1.5rem', textAlign: 'center' }}>{draft?.quantity || 0}</span>
                    <button className="btn btn-primary" onClick={() => updateDraftItem(item, 1)}>+</button>
                  </div>
                </div>

                {draft && draft.quantity > 0 && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      {SPECIAL_INSTRUCTIONS.map((instr) => (
                        <label key={instr} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input
                            type="checkbox"
                            checked={draft.specialInstructions.includes(instr)}
                            onChange={() => toggleInstruction(item.id!, instr)}
                          />
                          {instr}
                        </label>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Custom notes..."
                      value={draft.customNotes}
                      onChange={(e) => setCustomNotes(item.id!, e.target.value)}
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {draftItems.length > 0 && (
            <button className="btn btn-success" onClick={addToOrder} style={{ marginTop: '1rem', width: '100%' }}>
              Add {draftItems.reduce((s, d) => s + d.quantity, 0)} Item(s) to Order
            </button>
          )}
        </div>
      )}
    </div>
  );
}
