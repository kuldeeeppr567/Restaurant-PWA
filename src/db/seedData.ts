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
  // Classic Dosa
  { name: 'Plain Dosa', category: 'Classic Dosa', price: 60, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Butter Dosa', category: 'Classic Dosa', price: 80, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Ghee Dosa', category: 'Classic Dosa', price: 90, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Paper Dosa', category: 'Classic Dosa', price: 80, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Rava Dosa', category: 'Classic Dosa', price: 90, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Onion Dosa', category: 'Classic Dosa', price: 80, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Set Dosa (3 pcs)', category: 'Classic Dosa', price: 90, available: true, archived: false, createdAt: now, updatedAt: now },

  // Masala Dosa
  { name: 'Masala Dosa', category: 'Masala Dosa', price: 90, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Mysore Masala Dosa', category: 'Masala Dosa', price: 110, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Spring Dosa', category: 'Masala Dosa', price: 120, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Onion Masala Dosa', category: 'Masala Dosa', price: 100, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Pav Bhaji Dosa', category: 'Masala Dosa', price: 130, available: true, archived: false, createdAt: now, updatedAt: now },

  // Cheese Dosa
  { name: 'Cheese Dosa', category: 'Cheese Dosa', price: 120, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Cheese Masala Dosa', category: 'Cheese Dosa', price: 140, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Cheese Burst Dosa', category: 'Cheese Dosa', price: 160, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Cheese Schezwan Dosa', category: 'Cheese Dosa', price: 150, available: true, archived: false, createdAt: now, updatedAt: now },

  // Paneer Dosa
  { name: 'Paneer Dosa', category: 'Paneer Dosa', price: 130, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Paneer Masala Dosa', category: 'Paneer Dosa', price: 150, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Paneer Butter Masala Dosa', category: 'Paneer Dosa', price: 170, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Paneer Tikka Dosa', category: 'Paneer Dosa', price: 160, available: true, archived: false, createdAt: now, updatedAt: now },

  // Schezwan Dosa
  { name: 'Schezwan Dosa', category: 'Schezwan Dosa', price: 110, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Schezwan Masala Dosa', category: 'Schezwan Dosa', price: 130, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Schezwan Cheese Dosa', category: 'Schezwan Dosa', price: 150, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Schezwan Paneer Dosa', category: 'Schezwan Dosa', price: 160, available: true, archived: false, createdAt: now, updatedAt: now },

  // Special Dosa
  { name: 'Ghee Roast Dosa', category: 'Special Dosa', price: 140, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Family Dosa', category: 'Special Dosa', price: 200, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Egg Dosa', category: 'Special Dosa', price: 110, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Mushroom Dosa', category: 'Special Dosa', price: 140, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Mixed Veg Dosa', category: 'Special Dosa', price: 130, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Pizza Dosa', category: 'Special Dosa', price: 160, available: true, archived: false, createdAt: now, updatedAt: now },

  // Kids Dosa
  { name: 'Mini Plain Dosa', category: 'Kids Dosa', price: 60, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Mini Cheese Dosa', category: 'Kids Dosa', price: 80, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Chocolate Dosa', category: 'Kids Dosa', price: 90, available: true, archived: false, createdAt: now, updatedAt: now },

  // Uttapam
  { name: 'Plain Uttapam', category: 'Uttapam', price: 80, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Onion Uttapam', category: 'Uttapam', price: 90, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Mixed Veg Uttapam', category: 'Uttapam', price: 100, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Cheese Uttapam', category: 'Uttapam', price: 120, available: true, archived: false, createdAt: now, updatedAt: now },

  // Beverages
  { name: 'Filter Coffee', category: 'Beverages', price: 40, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Tea', category: 'Beverages', price: 30, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Buttermilk', category: 'Beverages', price: 40, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Lassi', category: 'Beverages', price: 50, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Fresh Lime Soda', category: 'Beverages', price: 50, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Mango Lassi', category: 'Beverages', price: 60, available: true, archived: false, createdAt: now, updatedAt: now },

  // Extras
  { name: 'Extra Chutney', category: 'Extras', price: 20, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Extra Sambhar', category: 'Extras', price: 30, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Curd', category: 'Extras', price: 30, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Papad', category: 'Extras', price: 20, available: true, archived: false, createdAt: now, updatedAt: now },
  { name: 'Ghee (extra)', category: 'Extras', price: 30, available: true, archived: false, createdAt: now, updatedAt: now },
];

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

    // Active sessions: table 1 (session 1), table 3 (session 2), table 5 (session 3)
    // Historical sessions: ids 4-18 (15 sessions)
    // We'll add sessions first, then tables referencing them.

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
    // Table 1 / session1: 3 items, all submitted
    const orderedAt1 = minutesAgo(40);
    await db.orderItems.bulkAdd([
      { sessionId: session1Id as number, tableId: 1, menuItemId: 8, itemName: 'Masala Dosa', priceSnapshot: 90, quantity: 2, specialInstructions: ['Extra crispy'], customNotes: '', status: 'submitted', orderedAt: orderedAt1 },
      { sessionId: session1Id as number, tableId: 1, menuItemId: 38, itemName: 'Filter Coffee', priceSnapshot: 40, quantity: 2, specialInstructions: [], customNotes: '', status: 'submitted', orderedAt: orderedAt1 },
      { sessionId: session1Id as number, tableId: 1, menuItemId: 44, itemName: 'Extra Chutney', priceSnapshot: 20, quantity: 1, specialInstructions: [], customNotes: '', status: 'submitted', orderedAt: orderedAt1 },
    ] as OrderItem[]);

    // Table 3 / session2: 2 items, one preparing, one ready
    const orderedAt2 = minutesAgo(25);
    await db.orderItems.bulkAdd([
      { sessionId: session2Id as number, tableId: 3, menuItemId: 9, itemName: 'Mysore Masala Dosa', priceSnapshot: 110, quantity: 1, specialInstructions: ['Less spicy'], customNotes: '', status: 'preparing', orderedAt: orderedAt2, preparingAt: minutesAgo(20) },
      { sessionId: session2Id as number, tableId: 3, menuItemId: 41, itemName: 'Lassi', priceSnapshot: 50, quantity: 1, specialInstructions: [], customNotes: '', status: 'ready', orderedAt: orderedAt2, preparingAt: minutesAgo(22), readyAt: minutesAgo(15) },
    ] as OrderItem[]);

    // Table 5 / session3: 2 served items
    const orderedAt3 = minutesAgo(55);
    await db.orderItems.bulkAdd([
      { sessionId: session3Id as number, tableId: 5, menuItemId: 14, itemName: 'Cheese Masala Dosa', priceSnapshot: 140, quantity: 1, specialInstructions: ['Extra cheese'], customNotes: '', status: 'served', orderedAt: orderedAt3, preparingAt: minutesAgo(50), readyAt: minutesAgo(40), servedAt: minutesAgo(38) },
      { sessionId: session3Id as number, tableId: 5, menuItemId: 43, itemName: 'Mango Lassi', priceSnapshot: 60, quantity: 2, specialInstructions: [], customNotes: '', status: 'served', orderedAt: orderedAt3, preparingAt: minutesAgo(52), readyAt: minutesAgo(45), servedAt: minutesAgo(43) },
    ] as OrderItem[]);

    // --- Service requests ---
    await db.serviceRequests.bulkAdd([
      { sessionId: session1Id as number, tableId: 1, tableName: 'Table 1', type: 'chutney', notes: 'Coconut chutney refill', requestedAt: minutesAgo(10), completed: false },
      { sessionId: session2Id as number, tableId: 3, tableName: 'Table 3', type: 'sambhar', notes: 'Extra sambhar please', requestedAt: minutesAgo(5), completed: false },
    ] as ServiceRequest[]);

    // --- Historical sessions (15 completed, past 7 days) ---
    const paymentMethods: PaymentMethod[] = ['cash', 'phonepe', 'paytm', 'other_upi', 'card', 'cash', 'phonepe', 'cash', 'paytm', 'card', 'cash', 'phonepe', 'other_upi', 'cash', 'mixed'];

    interface HistEntry { day: number; hour: number; tableNum: number; items: { menuId: number; name: string; price: number; qty: number }[] }

    const historicalEntries: HistEntry[] = [
      { day: 1, hour: 2, tableNum: 2, items: [{ menuId: 1, name: 'Plain Dosa', price: 60, qty: 2 }, { menuId: 38, name: 'Filter Coffee', price: 40, qty: 2 }] },
      { day: 1, hour: 5, tableNum: 4, items: [{ menuId: 8, name: 'Masala Dosa', price: 90, qty: 1 }, { menuId: 9, name: 'Mysore Masala Dosa', price: 110, qty: 1 }, { menuId: 39, name: 'Tea', price: 30, qty: 2 }] },
      { day: 1, hour: 8, tableNum: 6, items: [{ menuId: 13, name: 'Cheese Dosa', price: 120, qty: 2 }, { menuId: 41, name: 'Lassi', price: 50, qty: 2 }] },
      { day: 2, hour: 3, tableNum: 1, items: [{ menuId: 17, name: 'Paneer Dosa', price: 130, qty: 1 }, { menuId: 18, name: 'Paneer Masala Dosa', price: 150, qty: 1 }] },
      { day: 2, hour: 6, tableNum: 7, items: [{ menuId: 25, name: 'Ghee Roast Dosa', price: 140, qty: 1 }, { menuId: 38, name: 'Filter Coffee', price: 40, qty: 1 }, { menuId: 44, name: 'Extra Chutney', price: 20, qty: 1 }] },
      { day: 3, hour: 1, tableNum: 3, items: [{ menuId: 2, name: 'Butter Dosa', price: 80, qty: 2 }, { menuId: 40, name: 'Buttermilk', price: 40, qty: 2 }] },
      { day: 3, hour: 4, tableNum: 8, items: [{ menuId: 21, name: 'Schezwan Dosa', price: 110, qty: 1 }, { menuId: 22, name: 'Schezwan Masala Dosa', price: 130, qty: 1 }, { menuId: 42, name: 'Fresh Lime Soda', price: 50, qty: 2 }] },
      { day: 4, hour: 2, tableNum: 5, items: [{ menuId: 26, name: 'Family Dosa', price: 200, qty: 1 }, { menuId: 43, name: 'Mango Lassi', price: 60, qty: 3 }] },
      { day: 4, hour: 7, tableNum: 9, items: [{ menuId: 34, name: 'Plain Uttapam', price: 80, qty: 2 }, { menuId: 35, name: 'Onion Uttapam', price: 90, qty: 1 }, { menuId: 39, name: 'Tea', price: 30, qty: 3 }] },
      { day: 5, hour: 3, tableNum: 2, items: [{ menuId: 15, name: 'Cheese Burst Dosa', price: 160, qty: 1 }, { menuId: 19, name: 'Paneer Butter Masala Dosa', price: 170, qty: 1 }] },
      { day: 5, hour: 6, tableNum: 10, items: [{ menuId: 30, name: 'Pizza Dosa', price: 160, qty: 2 }, { menuId: 32, name: 'Mini Cheese Dosa', price: 80, qty: 1 }, { menuId: 38, name: 'Filter Coffee', price: 40, qty: 2 }] },
      { day: 6, hour: 1, tableNum: 4, items: [{ menuId: 7, name: 'Set Dosa (3 pcs)', price: 90, qty: 2 }, { menuId: 45, name: 'Extra Sambhar', price: 30, qty: 2 }] },
      { day: 6, hour: 5, tableNum: 6, items: [{ menuId: 11, name: 'Onion Masala Dosa', price: 100, qty: 1 }, { menuId: 12, name: 'Pav Bhaji Dosa', price: 130, qty: 1 }, { menuId: 40, name: 'Buttermilk', price: 40, qty: 1 }] },
      { day: 7, hour: 2, tableNum: 8, items: [{ menuId: 27, name: 'Egg Dosa', price: 110, qty: 2 }, { menuId: 46, name: 'Curd', price: 30, qty: 1 }] },
      { day: 7, hour: 6, tableNum: 3, items: [{ menuId: 3, name: 'Ghee Dosa', price: 90, qty: 1 }, { menuId: 5, name: 'Rava Dosa', price: 90, qty: 1 }, { menuId: 33, name: 'Chocolate Dosa', price: 90, qty: 1 }, { menuId: 38, name: 'Filter Coffee', price: 40, qty: 2 }] },
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

      const orderItems: Omit<OrderItem, 'id'>[] = entry.items.map((item) => ({
        sessionId,
        tableId: entry.tableNum,
        menuItemId: item.menuId,
        itemName: item.name,
        priceSnapshot: item.price,
        quantity: item.qty,
        specialInstructions: [],
        customNotes: '',
        status: 'served' as const,
        orderedAt: openedAt,
        preparingAt: openedAt,
        readyAt: closedAt,
        servedAt: closedAt,
      }));

      await db.orderItems.bulkAdd(orderItems as OrderItem[]);

      const subtotal = entry.items.reduce((sum, item) => sum + item.price * item.qty, 0);
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
