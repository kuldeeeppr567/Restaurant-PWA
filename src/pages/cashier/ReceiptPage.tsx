import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionRepository } from '../../repositories/sessionRepository.ts';
import { orderRepository } from '../../repositories/orderRepository.ts';
import { paymentRepository } from '../../repositories/paymentRepository.ts';
import { tableRepository } from '../../repositories/tableRepository.ts';
import type { DiningSession, OrderItem, Payment } from '../../types/index.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';

export default function ReceiptPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [session, setSession] = useState<DiningSession | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [tableName, setTableName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!sessionId) return;
      const id = Number(sessionId);
      const s = await sessionRepository.getById(id);
      if (s) {
        setSession(s);
        setTableName(s.tableName);
        const table = await tableRepository.getById(s.tableId);
        if (table) setTableName(table.name);
      }
      const orderItems = await orderRepository.getBySessionId(id);
      setItems(orderItems.filter((i) => i.status !== 'cancelled'));
      const p = await paymentRepository.getBySessionId(id);
      if (p) setPayment(p);
      setLoading(false);
    };
    load();
  }, [sessionId]);

  if (loading) return <div className="p-4">{t.common.loading}</div>;
  if (!session || !payment) return <div className="p-4">{t.receiptPage.notFound}</div>;

  const paidDate = new Date(payment.paidAt);

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="no-print mb-4 flex gap-2">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 underline"
        >
          &larr; {t.common.back}
        </button>
        <button
          onClick={() => window.print()}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t.receiptPage.print}
        </button>
      </div>

      <div className="receipt border p-6 text-sm">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold">{t.receiptPage.restaurantName}</h1>
          <p className="text-gray-500">
            {paidDate.toLocaleDateString()} {paidDate.toLocaleTimeString()}
          </p>
          <p className="font-semibold">{tableName}</p>
        </div>

        <table className="w-full mb-3">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">{t.receiptPage.colItem}</th>
              <th className="text-center py-1">{t.receiptPage.colQty}</th>
              <th className="text-right py-1">{t.receiptPage.colPrice}</th>
              <th className="text-right py-1">{t.receiptPage.colTotal}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-dashed">
                <td className="py-1">{item.itemName}</td>
                <td className="text-center py-1">{item.quantity}</td>
                <td className="text-right py-1">₹{item.priceSnapshot}</td>
                <td className="text-right py-1">₹{item.priceSnapshot * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 border-t pt-2">
          <div className="flex justify-between">
            <span>{t.receiptPage.subtotal}</span>
            <span>₹{payment.subtotal}</span>
          </div>
          {payment.discountAmount > 0 && (
            <div className="flex justify-between">
              <span>
                {t.receiptPage.discount}
                {payment.discountType === 'percentage' ? t.receiptPage.discountPct(payment.discountValue) : ''}
              </span>
              <span>-₹{payment.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t.receiptPage.gst(payment.taxRate)}</span>
            <span>₹{payment.taxAmount}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-1">
            <span>{t.receiptPage.grandTotal}</span>
            <span>₹{payment.total}</span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t text-sm">
          <div className="flex justify-between">
            <span>{t.receiptPage.payment}</span>
            <span>{t.paymentMethod[payment.method] ?? payment.method}</span>
          </div>
          {payment.referenceNumber && (
            <div className="flex justify-between">
              <span>{t.receiptPage.ref}</span>
              <span>{payment.referenceNumber}</span>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-gray-500">
          <p>{t.receiptPage.thankYou}</p>
        </div>
      </div>
    </div>
  );
}
