import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableRepository } from '../../repositories/tableRepository.ts';
import { sessionRepository } from '../../repositories/sessionRepository.ts';
import { orderRepository } from '../../repositories/orderRepository.ts';
import { paymentRepository } from '../../repositories/paymentRepository.ts';
import { PAYMENT_METHOD_LABELS } from '../../types/index.ts';
import type { RestaurantTable, DiningSession, OrderItem, PaymentMethod } from '../../types/index.ts';

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

  const discountAmount =
    discountType === 'percentage'
      ? Math.round((subtotal * discountValue) / 100)
      : discountValue;

  const taxableAmount = subtotal - discountAmount;
  const taxRate = 5;
  const taxAmount = Math.round((taxableAmount * taxRate) / 100);
  const grandTotal = taxableAmount + taxAmount;

  const handleRecordPayment = async () => {
    if (!session?.id || !selectedTable?.id) return;
    const confirmed = window.confirm(
      `Record payment of \u20B9${grandTotal} via ${PAYMENT_METHOD_LABELS[paymentMethod]}?`
    );
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

    await sessionRepository.update(session.id, { status: 'paid' });
    await tableRepository.updateStatus(selectedTable.id, 'paid');
    setIsPaid(true);
    await loadTables();
  };

  const handleCloseTable = async () => {
    if (!session?.id || !selectedTable?.id) return;
    await sessionRepository.close(session.id);
    await tableRepository.resetTable(selectedTable.id);
    setSelectedTable(null);
    setSession(null);
    setOrderItems([]);
    setIsPaid(false);
    await loadTables();
  };

  const handlePrintReceipt = () => {
    if (session?.id) {
      navigate(`/cashier/receipt/${session.id}`);
    }
  };

  const goBack = () => {
    setSelectedTable(null);
    setSession(null);
    setOrderItems([]);
    setIsPaid(false);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  if (!selectedTable) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Billing</h1>
        {tables.length === 0 ? (
          <p className="text-gray-500">No tables require billing.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => selectTable(table)}
                className={`p-4 rounded-lg border-2 text-left ${
                  table.status === 'billing_requested'
                    ? 'border-orange-500 bg-orange-50'
                    : table.status === 'paid'
                      ? 'border-green-500 bg-green-50'
                      : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="font-bold text-lg">{table.name}</div>
                <div className="text-sm capitalize">{table.status.replace(/_/g, ' ')}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={goBack} className="mb-4 text-blue-600 underline">
        &larr; Back to tables
      </button>
      <h1 className="text-2xl font-bold mb-2">{selectedTable.name} - Bill</h1>

      <table className="w-full mb-4 border-collapse">
        <thead>
          <tr className="border-b-2">
            <th className="text-left py-2">Item</th>
            <th className="text-center py-2">Qty</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.itemName}</td>
              <td className="text-center py-2">{item.quantity}</td>
              <td className="text-right py-2">{'\u20B9'}{item.priceSnapshot}</td>
              <td className="text-right py-2">{'\u20B9'}{item.priceSnapshot * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{'\u20B9'}{subtotal}</span>
        </div>

        {!isPaid && (
          <div className="flex items-center gap-2 flex-wrap">
            <span>Discount:</span>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')}
              className="border rounded px-2 py-1"
            >
              <option value="fixed">Fixed ({'\u20B9'})</option>
              <option value="percentage">Percentage (%)</option>
            </select>
            <input
              type="number"
              min={0}
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="border rounded px-2 py-1 w-24"
            />
            <span className="text-gray-500">= {'\u20B9'}{discountAmount}</span>
          </div>
        )}
        {isPaid && discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : 'fixed'})</span>
            <span>-{'\u20B9'}{discountAmount}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>GST ({taxRate}%)</span>
          <span>{'\u20B9'}{taxAmount}</span>
        </div>

        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Grand Total</span>
          <span>{'\u20B9'}{grandTotal}</span>
        </div>
      </div>

      {!isPaid && (
        <div className="space-y-4 mb-4">
          <div>
            <label className="block font-semibold mb-2">Payment Method</label>
            <div className="flex flex-wrap gap-3">
              {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(
                ([value, label]) => (
                  <label key={value} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    />
                    {label}
                  </label>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Reference Number (optional)</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Transaction ID / Reference"
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <button
            onClick={handleRecordPayment}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700"
          >
            Record Payment
          </button>
        </div>
      )}

      {isPaid && (
        <div className="space-y-3">
          <button
            onClick={handlePrintReceipt}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            Print Receipt
          </button>
          <button
            onClick={handleCloseTable}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700"
          >
            Close Table
          </button>
        </div>
      )}
    </div>
  );
}
