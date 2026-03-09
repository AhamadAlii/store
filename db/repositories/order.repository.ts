import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

interface CreateOrderItemInput {
  productId: number;
  quantity: number;
  price: number;
}

interface CreateOrderInput {
  id: string;
  userId?: number | null;
  phone: string;
  total: number;
  tokenAmount: number;
  remainingAmount: number;
  items: CreateOrderItemInput[];
}

interface FindAllFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

const orderInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
        },
      },
    },
  },
} as const;

export const orderRepository = {
  async create(data: CreateOrderInput) {
    const { items, ...orderData } = data;

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          ...orderData,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: orderInclude,
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }

      return order;
    });
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
  },

  async findByPhoneAndId(phone: string, id: string) {
    return prisma.order.findFirst({
      where: { id, phone },
      include: orderInclude,
    });
  },

  async findAll(filters: FindAllFilters = {}) {
    const { status, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = filters;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: orderInclude,
    });
  },

  async findOrdersNeedingReminder(intervalMs: number) {
    const cutoff = new Date(Date.now() - intervalMs);

    return prisma.order.findMany({
      where: {
        status: {
          notIn: ["DELIVERED", "CANCELLED", "PENDING"],
        },
        OR: [
          { lastReminderAt: null },
          { lastReminderAt: { lt: cutoff } },
        ],
      },
      include: orderInclude,
    });
  },

  async markNotified(id: string) {
    return prisma.order.update({
      where: { id },
      data: { notifiedAt: new Date() },
    });
  },

  async linkRazorpayOrder(id: string, razorpayOrderId: string) {
    return prisma.order.update({
      where: { id },
      data: { razorpayOrderId },
    });
  },

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    razorpayPaymentId: string
  ) {
    return prisma.order.update({
      where: { id },
      data: { paymentStatus, razorpayPaymentId },
      include: orderInclude,
    });
  },

  async markReminderSent(id: string) {
    return prisma.order.update({
      where: { id },
      data: { lastReminderAt: new Date() },
    });
  },

  async getAnalytics() {
    const [totalOrders, revenue, pendingCount] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { status: "PENDING" },
      }),
    ]);

    return {
      totalOrders,
      revenue: revenue._sum.total ?? 0,
      pendingCount,
    };
  },
};
