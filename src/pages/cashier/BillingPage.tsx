import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Landmark, QrCode, Wallet } from 'lucide-react';
import { tableRepository } from '../../repositories/tableRepository.ts';
import { sessionRepository } from '../../repositories/sessionRepository.ts';
import { orderRepository } from '../../repositories/orderRepository.ts';
import { paymentRepository } from '../../repositories/paymentRepository.ts';
import { PAYMENT_METHOD_LABELS } from '../../types/index.ts';
import type { RestaurantTable, DiningSession, OrderItem, PaymentMethod } from '../../types/index.ts';

const paymentIcons: Record<PaymentMethod, ReactNode> = {
  cash: <Wallet size={18} />,
  card: <CreditCard size={18} />,
  phonepe: <QrCode size={18} />,
  paytm: <QrCode size={18} />,
  other_upi: <QrCode size={18} />,
  mixed: <Landmark size={18} />,
};

export default function BillingPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [session, setSession] = useState<DiningSession | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTables = useCallback(async () => {
    const allTables = await tableRepository.getAll();
    const billingTables = allTables.filter(
      (t) => t.status === 'occupied' || t.status === 'billing_requested' || t.status === 'paid'
    );
    setTables(billingTables);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const selectTable = async (table: RestaurantTable) => {
    setSelectedTable(table);
    if (table.currentSessionId) {
      const s = await sessionRepository.getById(table.currentSessionId);
      if (s) {
        setSession(s);
        const items = await orderRepository.getBySessionId(s.id!);
        setOrderItems(items.filter((i) => i.status !== 'cancelled'));

        const existingPayment = await paymentRepository.getBySessionId(s.id!);
        if (existingPayment) {
          setDiscountType(existingPayment.discountType);
          setDiscountValue(existingPayment.discountValue);
          setPaymentMethod(existingPayment.method);
          setReferenceNumber(existingPayment.referenceNumber);
          setIsPaid(true);
        } else {
          setDiscountType('fixed');
          setDiscountValue(0);
          setPaymentMethod('cash');
          setReferenceNumber('');
          setIsPaid(table.status === 'paid');
        }
      }
    }
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
  const discountAmount = discountType === 'percentage' ? Math.round((subtotal * discountValue) / 100) : discountValue;
  const taxableAmount = subtotal - discountAmount;
  const taxRate = 5;
  const taxAmount = Math.round((taxableAmount * taxRate) / 100);
  const grandTotal = taxableAmount + taxAmount;

  const handleRecordPayment = async () => {
    if (!session?.id || !selectedTable?.id) return;
    const confirmed = window.confirm(`Record payment of \u20B9${grandTotal} via ${PAYMENT_METHOD_LABELS[paymentMethod]}?`);
    if (!confirmed) return;

    await paymentRepository.create({
      sessionId: session.id,
      tableId: selectedTable.id,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      taxAmount,
      total: grandTotal,
      method: paymentMethod,
      referenceNumber,
      paidAt: new Date().toISOString(),
    });

    const closedAt = new Date().toISOString();
    await sessionRepository.update(session.id, { status: 'paid', closedAt });
    await tableRepository.resetTable(selectedTable.id);
    setIsPaid(true);
    await loadTables();
  };

  const handleDone = () => {
    setSelectedTable(null);
    setSession(null);
    setOrderItems([]);
    setIsPaid(false);
  };

  const handlePrintReceipt = () => {
    if (session?.id) navigate(`/cashier/receipt/${session.id}`);
  };

  const goBack = () => {
    setSelectedTable(null);
    setSession(null);
    setOrderItems([]);
    setIsPaid(false);
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  if (!selectedTable) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Billing</h1>
            <p className="page-subtitle">Select a table to generate or settle the bill</p>
          </div>
        </div>

        {tables.length === 0 ? (
          <p className="page-subtitle">No tables require billing.</p>
        ) : (
          <div className="table-grid">
            {tables.map((table) => (
              <motion.button
                key={table.id}
                onClick={() => selectTable(table)}
                className={`card table-tile status-tint-${table.status}`}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-left">
                  <div className="text-2xl font-bold">{table.name}</div>
                  <div style={{ marginTop: 'var(--spacing-1)' }} className={`status-badge ${table.status}`}>{table.status.replace(/_/g, ' ')}</div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '860px' }}>
      <button onClick={goBack} className="btn btn-secondary" style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back to tables
      </button>

      <div className="card billing-summary" style={{ marginBottom: '20px' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: 6 }}>{selectedTable.name} Bill</h1>
        <p className="page-subtitle">Wallet-style order summary and payment settlement</p>
      </div>

      <div className="billing-layout">
        <div className="card">
          <div className="table-wrap" style={{ marginBottom: '12px' }}>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.itemName}</td>
                    <td>{item.quantity}</td>
                    <td>\u20B9{item.priceSnapshot}</td>
                    <td>\u20B9{item.priceSnapshot * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bill-row"><span>Subtotal</span><span>\u20B9{subtotal}</span></div>

          {!isPaid && (
            <div className="bill-row" style={{ alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span>Discount</span>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')} style={{ maxWidth: 170 }}>
                <option value="fixed">Fixed (\u20B9)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
              <input type="number" min={0} value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} style={{ maxWidth: 120 }} />
              <span className="page-subtitle">= \u20B9{discountAmount}</span>
            </div>
          )}

          {isPaid && discountAmount > 0 && (
            <div className="bill-row"><span>Discount</span><span>-\u20B9{discountAmount}</span></div>
          )}

          <div className="bill-row"><span>GST ({taxRate}%)</span><span>\u20B9{taxAmount}</span></div>
          <div className="bill-row total-row"><span>Grand Total</span><span>\u20B9{grandTotal}</span></div>
        </div>

        {!isPaid && (
          <div className="card">
            <label>Payment Method</label>
            <div className="payment-options" style={{ marginBottom: '16px' }}>
              {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                <button key={value} type="button" className={`payment-option ${paymentMethod === value ? 'active' : ''}`} onClick={() => setPaymentMethod(value)}>
                  {paymentIcons[value]}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="form-group">
              <label>Reference Number (optional)</label>
              <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Transaction ID / Reference" />
            </div>

            <button onClick={handleRecordPayment} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '4px' }}>
              Record Payment
            </button>
          </div>
        )}

        {isPaid && (
          <div className="card" style={{ display: 'grid', gap: '12px' }}>
            <button onClick={handlePrintReceipt} className="btn btn-primary">Print Receipt</button>
            <button onClick={handleDone} className="btn btn-secondary">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
