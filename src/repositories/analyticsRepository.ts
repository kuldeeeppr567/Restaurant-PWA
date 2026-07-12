import { db } from '../db/index.ts';
import type { Payment, OrderItem } from '../types/index.ts';

function todayRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  return { start, end };
}

export const analyticsRepository = {
  async getTodaySales(): Promise<number> {
    const { start, end } = todayRange();
    const payments = await db.payments.where('paidAt').between(start, end, true, false).toArray();
    return payments.reduce((sum, p) => sum + p.total, 0);
  },

  async getCompletedOrdersCount(): Promise<number> {
    const { start, end } = todayRange();
    const payments = await db.payments.where('paidAt').between(start, end, true, false).toArray();
    return payments.length;
  },

  async getAverageBillValue(): Promise<number> {
    const { start, end } = todayRange();
    const payments = await db.payments.where('paidAt').between(start, end, true, false).toArray();
    if (payments.length === 0) return 0;
    return payments.reduce((sum, p) => sum + p.total, 0) / payments.length;
  },

  async getTopSellingItems(limit = 10): Promise<{ itemName: string; quantity: number }[]> {
    const orders = await db.orderItems.toArray();
    const served = orders.filter(o => o.status === 'served');
    const counts = new Map<string, number>();
    for (const o of served) {
      counts.set(o.itemName, (counts.get(o.itemName) ?? 0) + o.quantity);
    }
    return [...counts.entries()]
      .map(([itemName, quantity]) => ({ itemName, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  },

  async getRevenueByItem(): Promise<{ itemName: string; revenue: number }[]> {
    const orders = await db.orderItems.toArray();
    const served = orders.filter(o => o.status === 'served');
    const revenue = new Map<string, number>();
    for (const o of served) {
      revenue.set(o.itemName, (revenue.get(o.itemName) ?? 0) + o.priceSnapshot * o.quantity);
    }
    return [...revenue.entries()]
      .map(([itemName, rev]) => ({ itemName, revenue: rev }))
      .sort((a, b) => b.revenue - a.revenue);
  },

  async getSalesByDay(days = 7): Promise<{ date: string; total: number; count: number }[]> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1).toISOString();
    const payments = await db.payments.where('paidAt').aboveOrEqual(start).toArray();
    const byDay = new Map<string, { total: number; count: number }>();
    for (const p of payments) {
      const date = p.paidAt.slice(0, 10);
      const entry = byDay.get(date) ?? { total: 0, count: 0 };
      entry.total += p.total;
      entry.count += 1;
      byDay.set(date, entry);
    }
    return [...byDay.entries()]
      .map(([date, { total, count }]) => ({ date, total, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async getSalesByPaymentMethod(): Promise<{ method: string; total: number; count: number }[]> {
    const payments = await db.payments.toArray();
    const byMethod = new Map<string, { total: number; count: number }>();
    for (const p of payments) {
      const entry = byMethod.get(p.method) ?? { total: 0, count: 0 };
      entry.total += p.total;
      entry.count += 1;
      byMethod.set(p.method, entry);
    }
    return [...byMethod.entries()]
      .map(([method, { total, count }]) => ({ method, total, count }))
      .sort((a, b) => b.total - a.total);
  },

  async getAveragePrepTime(): Promise<number> {
    const orders = await db.orderItems.toArray();
    const withTimes = orders.filter(o => o.orderedAt && o.readyAt);
    if (withTimes.length === 0) return 0;
    const totalMs = withTimes.reduce((sum, o) => {
      return sum + (new Date(o.readyAt!).getTime() - new Date(o.orderedAt).getTime());
    }, 0);
    return totalMs / withTimes.length / 60000; // return in minutes
  },

  async getRecentBills(limit = 20): Promise<Payment[]> {
    return db.payments.orderBy('paidAt').reverse().limit(limit).toArray();
  },

  async getOrdersBySession(sessionId: number): Promise<OrderItem[]> {
    return db.orderItems.where('sessionId').equals(sessionId).toArray();
  },
};
