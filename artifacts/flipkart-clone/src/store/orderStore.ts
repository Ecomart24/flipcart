import { CartItem } from "./cartStore";

export type PaymentType = "upi" | "card" | "netbanking" | "cod";
export type OrderStatus = "Paid" | "Pending" | "COD" | "Refunded" | "Cancelled";
export const ORDER_STORAGE_KEY = "fk_orders";
export const ORDER_UPDATED_EVENT = "fk_orders_updated";
const ORDER_SESSION_KEY = "fk_orders_session";
const LEGACY_ORDER_KEYS = ["purchase_history", "fk_purchase_history"];

export interface Order {
  orderId: string;
  placedAt: string;
  items: CartItem[];
  address: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    addressType: string;
  };
  payment: {
    type: PaymentType;
    upiIdMasked?: string;
    cardMasked?: string;
    cardLast4?: string;
    bank?: string;
    otpMasked?: string;
  };
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  savings: number;
  status: OrderStatus;
}

function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FK${ts}${rand}`;
}

let inMemoryOrders: Order[] = [];

function cloneOrders(orders: Order[]) {
  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item })),
    address: { ...order.address },
    payment: { ...order.payment },
  }));
}

function parseOrders(raw: string | null): Order[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as Order[];
  } catch {
    return null;
  }
}

function safeReadOrders(
  storage: Pick<Storage, "getItem"> | undefined,
  key: string,
): Order[] | null {
  if (!storage) return null;
  try {
    return parseOrders(storage.getItem(key));
  } catch {
    return null;
  }
}

function safeWriteOrders(
  storage: Pick<Storage, "setItem"> | undefined,
  key: string,
  payload: string,
) {
  if (!storage) return;
  try {
    storage.setItem(key, payload);
  } catch {}
}

function loadOrders(): Order[] {
  if (typeof window === "undefined") return cloneOrders(inMemoryOrders);

  const localOrders = safeReadOrders(window.localStorage, ORDER_STORAGE_KEY);
  if (localOrders) {
    inMemoryOrders = cloneOrders(localOrders);
    return cloneOrders(localOrders);
  }

  const sessionOrders =
    safeReadOrders(window.sessionStorage, ORDER_STORAGE_KEY) ??
    safeReadOrders(window.sessionStorage, ORDER_SESSION_KEY);
  if (sessionOrders) {
    inMemoryOrders = cloneOrders(sessionOrders);
    return cloneOrders(sessionOrders);
  }

  for (const key of LEGACY_ORDER_KEYS) {
    const legacyOrders =
      safeReadOrders(window.localStorage, key) ??
      safeReadOrders(window.sessionStorage, key);
    if (legacyOrders) {
      inMemoryOrders = cloneOrders(legacyOrders);
      return cloneOrders(legacyOrders);
    }
  }

  return cloneOrders(inMemoryOrders);
}

function notifyOrdersUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ORDER_UPDATED_EVENT));
}

function saveOrders(orders: Order[]) {
  const clonedOrders = cloneOrders(orders);
  inMemoryOrders = clonedOrders;

  if (typeof window !== "undefined") {
    const payload = JSON.stringify(clonedOrders);
    safeWriteOrders(window.localStorage, ORDER_STORAGE_KEY, payload);
    safeWriteOrders(window.sessionStorage, ORDER_STORAGE_KEY, payload);
    safeWriteOrders(window.sessionStorage, ORDER_SESSION_KEY, payload);
  }

  notifyOrdersUpdated();
}

export function placeOrder(data: Omit<Order, "orderId" | "placedAt" | "status">): Order {
  const order: Order = {
    ...data,
    orderId: generateOrderId(),
    placedAt: new Date().toISOString(),
    status: data.payment.type === "cod" ? "COD" : "Paid",
  };
  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

export function updateOrder(orderId: string, patch: Partial<Omit<Order, "orderId" | "placedAt">>): Order | null {
  const orders = loadOrders();
  const index = orders.findIndex((order) => order.orderId === orderId);
  if (index === -1) return null;

  const target = orders[index];
  const nextOrder: Order = {
    ...target,
    ...patch,
    address: patch.address ? { ...target.address, ...patch.address } : target.address,
    payment: patch.payment ? { ...target.payment, ...patch.payment } : target.payment,
    items: patch.items ? patch.items.map((item) => ({ ...item })) : target.items,
  };
  orders[index] = nextOrder;
  saveOrders(orders);
  return nextOrder;
}

export function getOrders(): Order[] {
  return loadOrders();
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = loadOrders().map((o) =>
    o.orderId === orderId ? { ...o, status } : o
  );
  saveOrders(orders);
}

export function deleteOrder(orderId: string) {
  const orders = loadOrders().filter((o) => o.orderId !== orderId);
  saveOrders(orders);
}

export function clearAllOrders() {
  saveOrders([]);
}

export function getOrderStats(orders: Order[]) {
  const totalRevenue = orders.filter((o) => o.status === "Paid").reduce((s, o) => s + o.totalAmount, 0);
  const codRevenue = orders.filter((o) => o.status === "COD").reduce((s, o) => s + o.totalAmount, 0);
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === "Paid").length;
  const codOrders = orders.filter((o) => o.status === "COD").length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const refundedOrders = orders.filter((o) => o.status === "Refunded").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;
  const uniqueCustomers = new Set(orders.map((o) => o.address.phone)).size;
  const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue + codRevenue) / totalOrders) : 0;

  const byPaymentType: Record<string, number> = {};
  orders.forEach((o) => {
    byPaymentType[o.payment.type] = (byPaymentType[o.payment.type] || 0) + 1;
  });

  const revenueByDay: Record<string, number> = {};
  orders.forEach((o) => {
    if (o.status === "Paid" || o.status === "COD") {
      const day = o.placedAt.slice(0, 10);
      revenueByDay[day] = (revenueByDay[day] || 0) + o.totalAmount;
    }
  });

  return {
    totalRevenue,
    codRevenue,
    totalOrders,
    paidOrders,
    codOrders,
    pendingOrders,
    refundedOrders,
    cancelledOrders,
    uniqueCustomers,
    avgOrderValue,
    byPaymentType,
    revenueByDay,
  };
}
