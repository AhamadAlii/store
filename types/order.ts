import type { Product } from "./product";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export type OrderItem = {
  id: number;
  orderId: string;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
};

export type Order = {
  id: string;
  userId: number | null;
  phone: string;
  status: OrderStatus;
  total: number;
  tokenAmount: number;
  remainingAmount: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paymentStatus: PaymentStatus;
  notifiedAt: Date | null;
  lastReminderAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
};

export type OrderWithItems = Order & {
  user?: {
    id: number;
    name: string;
    phone: string;
  } | null;
};
