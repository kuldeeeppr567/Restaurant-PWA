import Dexie, { type Table } from 'dexie';
import type { MenuItem, RestaurantTable, DiningSession, OrderItem, ServiceRequest, Payment } from '../types/index.ts';

export class RestaurantDB extends Dexie {
  menuItems!: Table<MenuItem, number>;
  restaurantTables!: Table<RestaurantTable, number>;
  diningSessions!: Table<DiningSession, number>;
  orderItems!: Table<OrderItem, number>;
  serviceRequests!: Table<ServiceRequest, number>;
  payments!: Table<Payment, number>;

  constructor() {
    super('RestaurantPWA');
    this.version(1).stores({
      menuItems: '++id, category, available, archived',
      restaurantTables: '++id, status, currentSessionId',
      diningSessions: '++id, tableId, status, openedAt, closedAt',
      orderItems: '++id, sessionId, tableId, menuItemId, status, orderedAt',
      serviceRequests: '++id, sessionId, tableId, completed, requestedAt',
      payments: '++id, sessionId, tableId, paidAt, method',
    });
  }
}

export const db = new RestaurantDB();
