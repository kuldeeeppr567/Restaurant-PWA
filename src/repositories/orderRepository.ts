import { db } from '../db/index.ts';
import type { OrderItem, OrderItemStatus } from '../types/index.ts';

export const orderRepository = {
  async getBySessionId(sessionId: number): Promise<OrderItem[]> {
    return db.orderItems.where('sessionId').equals(sessionId).toArray();
  },

  async getByStatus(status: OrderItemStatus): Promise<OrderItem[]> {
    return db.orderItems.where('status').equals(status).toArray();
  },

  async getKitchenQueue(): Promise<OrderItem[]> {
    const items = await db.orderItems.toArray();
    return items.filter(i => i.status === 'submitted' || i.status === 'preparing' || i.status === 'ready');
  },

  async getById(id: number): Promise<OrderItem | undefined> {
    return db.orderItems.get(id);
  },

  async create(item: Omit<OrderItem, 'id'>): Promise<number> {
    return db.orderItems.add(item as OrderItem);
  },

  async bulkCreate(items: Omit<OrderItem, 'id'>[]): Promise<number> {
    return db.orderItems.bulkAdd(items as OrderItem[]);
  },

  async updateStatus(id: number, status: OrderItemStatus): Promise<void> {
    const now = new Date().toISOString();
    const changes: Partial<OrderItem> = { status };
    if (status === 'preparing') changes.preparingAt = now;
    if (status === 'ready') changes.readyAt = now;
    if (status === 'served') changes.servedAt = now;
    await db.orderItems.update(id, changes);
  },
};
