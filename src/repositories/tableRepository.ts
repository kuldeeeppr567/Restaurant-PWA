import { db } from '../db/index.ts';
import type { RestaurantTable, TableStatus } from '../types/index.ts';

export const tableRepository = {
  async getAll(): Promise<RestaurantTable[]> {
    return db.restaurantTables.toArray();
  },

  async getById(id: number): Promise<RestaurantTable | undefined> {
    return db.restaurantTables.get(id);
  },

  async create(table: Omit<RestaurantTable, 'id'>): Promise<number> {
    return db.restaurantTables.add(table as RestaurantTable);
  },

  async update(id: number, changes: Partial<RestaurantTable>): Promise<void> {
    await db.restaurantTables.update(id, changes);
  },

  async updateStatus(id: number, status: TableStatus, currentSessionId?: number): Promise<void> {
    await db.restaurantTables.update(id, { status, currentSessionId });
  },

  async resetTable(id: number): Promise<void> {
    await db.restaurantTables.update(id, { status: 'available' as TableStatus, currentSessionId: undefined });
  },

  async bulkCreate(tables: Omit<RestaurantTable, 'id'>[]): Promise<number> {
    return db.restaurantTables.bulkAdd(tables as RestaurantTable[]);
  },
};
