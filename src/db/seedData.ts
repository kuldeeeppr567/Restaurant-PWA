import { db } from './database.ts';
import type { MenuItem, RestaurantTable, DiningSession, OrderItem, ServiceRequest, Payment, PaymentMethod } from '../types/index.ts';

function daysAgo(days: number, hoursOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hoursOffset);
  return d.toISOString();
}

function minutesAgo(minutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
}

const now = new Date().toISOString();

const menuItemsData: Omit<MenuItem, 'id'>[] = [
  // Indian > South Indian
  { name: 'Masala Dosa', category: 'Indian > South Indian', price: 120, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Idli Sambar', category: 'Indian > South Indian', price: 90, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Medu Vada', category: 'Indian > South Indian', price: 100, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Rava Dosa', category: 'Indian > South Indian', price: 130, available: true, archived: false, createdAt: now, updatedAt: now },

  // Indian > North Indian
  { name: 'Paneer Butter Masala', category: 'Indian > North Indian', price: 220, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Dal Tadka', category: 'Indian > North Indian', price: 180, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Veg Biryani', category: 'Indian > North Indian', price: 200, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Butter Naan', category: 'Indian > North Indian', price: 45, available: true, archived: false, createdAt: now, updatedAt: now },

  // Global > Italian
  { name: 'Margherita Pizza', category: 'Global > Italian', price: 260, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Veggie Pasta', category: 'Global > Italian', price: 210, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'White Sauce Pasta', category: 'Global > Italian', price: 230, available: true, archived: false, createdAt: now, updatedAt: now },

  // Global > Street Food
  { name: 'Veg Burger', category: 'Global > Street Food', price: 130, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Grilled Sandwich', category: 'Global > Street Food', price: 140, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Veg Maggi', category: 'Global > Street Food', price: 95, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'French Fries', category: 'Global > Street Food', price: 110, available: true, archived: false, createdAt: now, updatedAt: now },

  // Asian > Indo-Chinese
  { name: 'Hakka Noodles', category: 'Asian > Indo-Chinese', price: 190, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Chilli Paneer', category: 'Asian > Indo-Chinese', price: 220, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Veg Manchurian', category: 'Asian > Indo-Chinese', price: 200, available: true, archived: false, createdAt: now, updatedAt: now },

  // Beverages
  { name: 'Masala Chai', category: 'Beverages > Hot', price: 40, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Filter Coffee', category: 'Beverages > Hot', price: 50, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Fresh Lime Soda', category: 'Beverages > Cold', price: 70, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Mango Shake', category: 'Beverages > Cold', price: 90, available: true, archived: false, createdAt: now, updatedAt: now },

  // Desserts
  { name: 'Gulab Jamun', category: 'Desserts > Indian', price: 80, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Rasmalai', category: 'Desserts > Indian', price: 95, available: true, archived: false, createdAt: now, updatedAt: now },
];

interface DemoOrder {
  name: string;
  qty: number;
  status?: OrderItem['status'];
  specialInstructions?: string[];
}

export async function loadDemoData(): Promise<void> {
  await db.transaction('rw', [db.menuItems, db.restaurantTables, db.diningSessions, db.orderItems, db.serviceRequests, db.payments], async () => {
    // Clear all tables
    await db.menuItems.clear();
    await db.restaurantTables.clear();
    await db.diningSessions.clear();
    await db.orderItems.clear();
    await db.serviceRequests.clear();
    await db.payments.clear();

    // Insert menu items
    await db.menuItems.bulkAdd(menuItemsData as MenuItem[]);

    const insertedItems = await db.menuItems.toArray();
    const menuByName = new Map(insertedItems.map((item) => [item.name, item]));

    const resolveMenu = (name: string) => {
      const item = menuByName.get(name);
      if (!item?.id) {
        throw new Error(`Demo menu item not found: ${name}`);
      }
      return item;
    };

    const addOrderItems = async (sessionId: number, tableId: number, orderedAt: string, items: DemoOrder[]) => {
      const orderItems: Omit<OrderItem, 'id'>[] = items.map((entry) => {
        const menuItem = resolveMenu(entry.name);
        const status = entry.status ?? 'served';
        return {
          sessionId,
          tableId,
          menuItemId: menuItem.id!,
          itemName: menuItem.name,
          priceSnapshot: menuItem.price,
          quantity: entry.qty,
          specialInstructions: entry.specialInstructions ?? [],
          customNotes: '',
          status,
          orderedAt,
          preparingAt: status !== 'submitted' ? orderedAt : undefined,
          readyAt: status === 'served' || status === 'ready' ? orderedAt : undefined,
          servedAt: status === 'served' ? orderedAt : undefined,
        };
      });

      await db.orderItems.bulkAdd(orderItems as OrderItem[]);
    };

    // --- Active sessions ---
    const session1Id = await db.diningSessions.add({
      tableId: 1,
      tableName: 'Table 1',
      openedAt: minutesAgo(45),
      status: 'occupied',
    } as DiningSession);

    const session2Id = await db.diningSessions.add({
      tableId: 3,
      tableName: 'Table 3',
      openedAt: minutesAgo(30),
      status: 'occupied',
    } as DiningSession);

    const session3Id = await db.diningSessions.add({
      tableId: 5,
      tableName: 'Table 5',
      openedAt: minutesAgo(60),
      status: 'billing_requested',
    } as DiningSession);

    // --- Tables ---
    const tablesData: Omit<RestaurantTable, 'id'>[] = [];
    for (let i = 1; i <= 10; i++) {
      let status: RestaurantTable['status'] = 'available';
      let currentSessionId: number | undefined;
      if (i === 1) { status = 'occupied'; currentSessionId = session1Id as number; }
      if (i === 3) { status = 'occupied'; currentSessionId = session2Id as number; }
      if (i === 5) { status = 'billing_requested'; currentSessionId = session3Id as number; }
      tablesData.push({ name: `Table ${i}`, status, capacity: 4, currentSessionId });
    }
    await db.restaurantTables.bulkAdd(tablesData as RestaurantTable[]);

    // --- Active order items ---
    await addOrderItems(session1Id as number, 1, minutesAgo(40), [
      { name: 'Masala Dosa', qty: 2, status: 'submitted', specialInstructions: ['Extra crispy'] },
      { name: 'Filter Coffee', qty: 2, status: 'submitted' },
    ]);

    await addOrderItems(session2Id as number, 3, minutesAgo(25), [
      { name: 'Margherita Pizza', qty: 1, status: 'preparing', specialInstructions: ['Less spicy'] },
      { name: 'Fresh Lime Soda', qty: 1, status: 'ready' },
    ]);

    await addOrderItems(session3Id as number, 5, minutesAgo(55), [
      { name: 'Paneer Butter Masala', qty: 1, status: 'served' },
      { name: 'Butter Naan', qty: 3, status: 'served' },
      { name: 'Mango Shake', qty: 2, status: 'served' },
    ]);

    // --- Service requests ---
    await db.serviceRequests.bulkAdd([
      { sessionId: session1Id as number, tableId: 1, tableName: 'Table 1', type: 'water', notes: 'Need drinking water', requestedAt: minutesAgo(10), completed: false },
      { sessionId: session2Id as number, tableId: 3, tableName: 'Table 3', type: 'plates_spoons', notes: 'Need extra plates', requestedAt: minutesAgo(5), completed: false },
    ] as ServiceRequest[]);

    // --- Historical sessions (15 completed, past 7 days) ---
    const paymentMethods: PaymentMethod[] = ['cash', 'phonepe', 'paytm', 'other_upi', 'card', 'cash', 'phonepe', 'cash', 'paytm', 'card', 'cash', 'phonepe', 'other_upi', 'cash', 'mixed'];

    interface HistEntry {
      day: number;
      hour: number;
      tableNum: number;
      items: DemoOrder[];
    }

    const historicalEntries: HistEntry[] = [
      { day: 1, hour: 2, tableNum: 2, items: [{ name: 'Veg Maggi', qty: 2 }, { name: 'Masala Chai', qty: 2 }] },
      { day: 1, hour: 5, tableNum: 4, items: [{ name: 'Paneer Butter Masala', qty: 1 }, { name: 'Butter Naan', qty: 2 }] },
      { day: 1, hour: 8, tableNum: 6, items: [{ name: 'Hakka Noodles', qty: 2 }, { name: 'Fresh Lime Soda', qty: 2 }] },
      { day: 2, hour: 3, tableNum: 1, items: [{ name: 'Veggie Pasta', qty: 1 }, { name: 'Gulab Jamun', qty: 2 }] },
      { day: 2, hour: 6, tableNum: 7, items: [{ name: 'Margherita Pizza', qty: 1 }, { name: 'Mango Shake', qty: 1 }] },
      { day: 3, hour: 1, tableNum: 3, items: [{ name: 'Idli Sambar', qty: 2 }, { name: 'Filter Coffee', qty: 2 }] },
      { day: 3, hour: 4, tableNum: 8, items: [{ name: 'Veg Manchurian', qty: 1 }, { name: 'Hakka Noodles', qty: 1 }] },
      { day: 4, hour: 2, tableNum: 5, items: [{ name: 'Rava Dosa', qty: 2 }, { name: 'Fresh Lime Soda', qty: 3 }] },
      { day: 4, hour: 7, tableNum: 9, items: [{ name: 'Veg Burger', qty: 2 }, { name: 'French Fries', qty: 1 }] },
      { day: 5, hour: 3, tableNum: 2, items: [{ name: 'White Sauce Pasta', qty: 1 }, { name: 'Masala Chai', qty: 2 }] },
      { day: 5, hour: 6, tableNum: 10, items: [{ name: 'Grilled Sandwich', qty: 2 }, { name: 'Veg Maggi', qty: 1 }] },
      { day: 6, hour: 1, tableNum: 4, items: [{ name: 'Dal Tadka', qty: 1 }, { name: 'Butter Naan', qty: 2 }] },
      { day: 6, hour: 5, tableNum: 6, items: [{ name: 'Chilli Paneer', qty: 1 }, { name: 'Fresh Lime Soda', qty: 1 }] },
      { day: 7, hour: 2, tableNum: 8, items: [{ name: 'Masala Dosa', qty: 2 }, { name: 'Rasmalai', qty: 1 }] },
      { day: 7, hour: 6, tableNum: 3, items: [{ name: 'Veg Biryani', qty: 1 }, { name: 'Mango Shake', qty: 2 }] },
    ];

    for (let i = 0; i < historicalEntries.length; i++) {
      const entry = historicalEntries[i];
      const openedAt = daysAgo(entry.day, entry.hour + 1);
      const closedAt = daysAgo(entry.day, entry.hour);

      const sessionId = await db.diningSessions.add({
        tableId: entry.tableNum,
        tableName: `Table ${entry.tableNum}`,
        openedAt,
        closedAt,
        status: 'paid',
      } as DiningSession) as number;

      await addOrderItems(sessionId, entry.tableNum, openedAt, entry.items);

      const subtotal = entry.items.reduce((sum, item) => sum + resolveMenu(item.name).price * item.qty, 0);
      const taxRate = 5;
      const taxAmount = Math.round(subtotal * taxRate / 100);
      const total = subtotal + taxAmount;

      await db.payments.add({
        sessionId,
        tableId: entry.tableNum,
        subtotal,
        discountType: 'fixed',
        discountValue: 0,
        discountAmount: 0,
        taxRate,
        taxAmount,
        total,
        method: paymentMethods[i],
        referenceNumber: paymentMethods[i] === 'cash' ? '' : `TXN${Date.now()}${i}`,
        paidAt: closedAt,
      } as Payment);
    }
  });
}

export async function resetDemoData(): Promise<void> {
  await db.transaction('rw', [db.menuItems, db.restaurantTables, db.diningSessions, db.orderItems, db.serviceRequests, db.payments], async () => {
    await db.menuItems.clear();
    await db.restaurantTables.clear();
    await db.diningSessions.clear();
    await db.orderItems.clear();
    await db.serviceRequests.clear();
    await db.payments.clear();
  });
}
