import { db } from '../db/index.ts';
import type { Payment } from '../types/index.ts';

export const paymentRepository = {
  async getBySessionId(sessionId: number): Promise<Payment | undefined> {
    const payments = await db.payments.where('sessionId').equals(sessionId).toArray();
    return payments[0];
  },

  async create(payment: Omit<Payment, 'id'>): Promise<number> {
    return db.payments.add(payment as Payment);
  },

  async getAll(): Promise<Payment[]> {
    return db.payments.toArray();
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
    return db.payments
      .where('paidAt')
      .between(startDate, endDate, true, true)
      .toArray();
  },
};
