import { db } from '../db/index.ts';
import type { DiningSession } from '../types/index.ts';

export const sessionRepository = {
  async getAll(): Promise<DiningSession[]> {
    return db.diningSessions.toArray();
  },

  async getById(id: number): Promise<DiningSession | undefined> {
    return db.diningSessions.get(id);
  },

  async getByTableId(tableId: number): Promise<DiningSession | undefined> {
    const sessions = await db.diningSessions.where('tableId').equals(tableId).toArray();
    return sessions.find(s => !s.closedAt);
  },

  async getActive(): Promise<DiningSession[]> {
    const sessions = await db.diningSessions.toArray();
    return sessions.filter(s => !s.closedAt);
  },

  async create(session: Omit<DiningSession, 'id'>): Promise<number> {
    return db.diningSessions.add(session as DiningSession);
  },

  async update(id: number, changes: Partial<DiningSession>): Promise<void> {
    await db.diningSessions.update(id, changes);
  },

  async close(id: number): Promise<void> {
    await db.diningSessions.update(id, {
      closedAt: new Date().toISOString(),
      status: 'available',
    });
  },
};
