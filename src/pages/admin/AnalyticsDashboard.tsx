import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { analyticsRepository } from '../../repositories/analyticsRepository.ts';
import { tableRepository } from '../../repositories/tableRepository.ts';
import { orderRepository } from '../../repositories/orderRepository.ts';
import { serviceRequestRepository } from '../../repositories/serviceRequestRepository.ts';
import { PAYMENT_METHOD_LABELS } from '../../types/index.ts';
import type { Payment, PaymentMethod } from '../../types/index.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';

type DateRange = 'today' | '7days' | '30days' | 'custom';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [todaySales, setTodaySales] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [avgBill, setAvgBill] = useState(0);
  const [occupiedCount, setOccupiedCount] = useState(0);
  const [pendingKitchen, setPendingKitchen] = useState(0);
  const [pendingService, setPendingService] = useState(0);
  const [topItems, setTopItems] = useState<{ itemName: string; quantity: number }[]>([]);
  const [salesByDay, setSalesByDay] = useState<{ date: string; total: number; count: number }[]>([]);
  const [salesByMethod, setSalesByMethod] = useState<{ method: string; total: number; count: number }[]>([]);
  const [revenueByItem, setRevenueByItem] = useState<{ itemName: string; revenue: number }[]>([]);
  const [recentBills, setRecentBills] = useState<Payment[]>([]);
  const [avgPrepTime, setAvgPrepTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const getDays = useCallback(() => {
    if (dateRange === 'today') return 1;
    if (dateRange === '7days') return 7;
    if (dateRange === '30days') return 30;
    return 7;
  }, [dateRange]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const days = getDays();

    const [
      sales,
      orders,
      avg,
      tables,
      kitchenQueue,
      serviceReqs,
      top,
      byDay,
      byMethod,
      byItem,
      bills,
      prepTime,
    ] = await Promise.all([
      analyticsRepository.getTodaySales(),
      analyticsRepository.getCompletedOrdersCount(),
      analyticsRepository.getAverageBillValue(),
      tableRepository.getAll(),
      orderRepository.getKitchenQueue(),
      serviceRequestRepository.getPending(),
      analyticsRepository.getTopSellingItems(10),
      analyticsRepository.getSalesByDay(days),
      analyticsRepository.getSalesByPaymentMethod(),
      analyticsRepository.getRevenueByItem(),
      analyticsRepository.getRecentBills(20),
      analyticsRepository.getAveragePrepTime(),
    ]);

    setTodaySales(sales);
    setTodayOrders(orders);
    setAvgBill(avg);
    setOccupiedCount(tables.filter((t) => t.status !== 'available').length);
    setPendingKitchen(kitchenQueue.length);
    setPendingService(serviceReqs.length);
    setTopItems(top);
    setSalesByDay(byDay);
    setSalesByMethod(
      byMethod.map((m) => ({
        ...m,
        method: PAYMENT_METHOD_LABELS[m.method as PaymentMethod] || m.method,
      }))
    );
    setRevenueByItem(byItem.slice(0, 10));
    setRecentBills(bills);
    setAvgPrepTime(prepTime);
    setLoading(false);
  }, [getDays]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div className="p-4">{t.analyticsDashboard.loading}</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">{t.analyticsDashboard.title}</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as DateRange)}
          className="border rounded px-3 py-2"
        >
          <option value="today">{t.analyticsDashboard.dateToday}</option>
          <option value="7days">{t.analyticsDashboard.date7days}</option>
          <option value="30days">{t.analyticsDashboard.date30days}</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <SummaryCard title={t.analyticsDashboard.cardSales} value={`₹${Math.round(todaySales)}`} />
        <SummaryCard title={t.analyticsDashboard.cardOrders} value={String(todayOrders)} />
        <SummaryCard title={t.analyticsDashboard.cardAvgBill} value={`₹${Math.round(avgBill)}`} />
        <SummaryCard title={t.analyticsDashboard.cardTables} value={String(occupiedCount)} />
        <SummaryCard title={t.analyticsDashboard.cardKitchen} value={String(pendingKitchen)} />
        <SummaryCard title={t.analyticsDashboard.cardService} value={String(pendingService)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Selling Items */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-bold mb-3">{t.analyticsDashboard.chartTopItems}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="itemName" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#8884d8" name={t.analyticsDashboard.chartQuantitySold} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Day */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-bold mb-3">{t.analyticsDashboard.chartSalesByDay}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#82ca9d" name={t.analyticsDashboard.chartRevenue} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Payment Method */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-bold mb-3">{t.analyticsDashboard.chartSalesByMethod}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesByMethod}
                dataKey="total"
                nameKey="method"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.method}
              >
                {salesByMethod.map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Menu Item */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-bold mb-3">{t.analyticsDashboard.chartRevenueByItem}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByItem}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="itemName" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#ffc658" name={t.analyticsDashboard.chartRevenue} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Prep Time */}
      <div className="mb-8 border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2">{t.analyticsDashboard.avgPrepTime}</h2>
        <p className="text-3xl font-bold">{avgPrepTime.toFixed(1)} {t.analyticsDashboard.min}</p>
      </div>

      {/* Recent Bills */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-3">{t.analyticsDashboard.recentBills}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2">
                <th className="text-left py-2">{t.analyticsDashboard.colDate}</th>
                <th className="text-right py-2">{t.analyticsDashboard.colSubtotal}</th>
                <th className="text-right py-2">{t.analyticsDashboard.colDiscount}</th>
                <th className="text-right py-2">{t.analyticsDashboard.colTax}</th>
                <th className="text-right py-2">{t.analyticsDashboard.colTotal}</th>
                <th className="text-left py-2">{t.analyticsDashboard.colMethod}</th>
              </tr>
            </thead>
            <tbody>
              {recentBills.map((bill) => (
                <tr key={bill.id} className="border-b">
                  <td className="py-2">{new Date(bill.paidAt).toLocaleString()}</td>
                  <td className="text-right py-2">₹{bill.subtotal}</td>
                  <td className="text-right py-2">₹{bill.discountAmount}</td>
                  <td className="text-right py-2">₹{bill.taxAmount}</td>
                  <td className="text-right py-2 font-bold">₹{bill.total}</td>
                  <td className="py-2">{t.paymentMethod[bill.method] ?? PAYMENT_METHOD_LABELS[bill.method]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="border rounded-lg p-4 text-center">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
