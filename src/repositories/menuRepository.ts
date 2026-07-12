import { db } from '../db/index.ts';
import type { MenuItem } from '../types/index.ts';

export const menuRepository = {
  async getAll(): Promise<MenuItem[]> {
    const items = await db.menuItems.toArray();
    return items.filter(i => !i.archived);
  },

  async getAllIncludingArchived(): Promise<MenuItem[]> {
    return db.menuItems.toArray();
  },

  async getAvailable(): Promise<MenuItem[]> {
    const items = await db.menuItems.toArray();
    return items.filter(i => i.available && !i.archived);
  },

  async getByCategory(category: string): Promise<MenuItem[]> {
    const items = await db.menuItems.where('category').equals(category).toArray();
    return items.filter(i => !i.archived);
  },

  async getById(id: number): Promise<MenuItem | undefined> {
    return db.menuItems.get(id);
  },

  async create(item: Omit<MenuItem, 'id'>): Promise<number> {
    return db.menuItems.add(item as MenuItem);
  },

  async update(id: number, changes: Partial<MenuItem>): Promise<void> {
    await db.menuItems.update(id, { ...changes, updatedAt: new Date().toISOString() });
  },

  async archive(id: number): Promise<void> {
    await db.menuItems.update(id, { archived: true, updatedAt: new Date().toISOString() });
  },

  async getCategories(): Promise<string[]> {
    const items = await db.menuItems.toArray();
    return [...new Set(items.filter(i => !i.archived).map(i => i.category))].sort();
  },
};
