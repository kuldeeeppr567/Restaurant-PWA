import { db } from '../db/index.ts';
import type { ServiceRequest } from '../types/index.ts';

export const serviceRequestRepository = {
  async getBySessionId(sessionId: number): Promise<ServiceRequest[]> {
    return db.serviceRequests.where('sessionId').equals(sessionId).toArray();
  },

  async getPending(): Promise<ServiceRequest[]> {
    const requests = await db.serviceRequests.toArray();
    return requests.filter(r => !r.completed);
  },

  async create(request: Omit<ServiceRequest, 'id'>): Promise<number> {
    return db.serviceRequests.add(request as ServiceRequest);
  },

  async complete(id: number): Promise<void> {
    await db.serviceRequests.update(id, {
      completed: true,
      completedAt: new Date().toISOString(),
    });
  },
};
