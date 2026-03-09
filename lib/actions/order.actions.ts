"use server";

import { auth } from "@/auth";
import { orderService } from "@/services/order.service";
import { createSafeResponse, AppError } from "@/lib/errors";
import type { OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new AppError("Forbidden: admin access required", 403, "FORBIDDEN");
  }

  return session;
}

export async function createOrder(
  phone: string,
  items: { productId: number; quantity: number }[]
) {
  return createSafeResponse(() => orderService.createOrder(phone, items));
}

export async function getOrderTracking(phone: string, orderId: string) {
  return createSafeResponse(() =>
    orderService.getOrderTracking(phone, orderId)
  );
}

export async function listOrders(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return createSafeResponse(async () => {
    await requireAdmin();
    const sanitizedFilters = filters
      ? {
          ...filters,
          status: filters.status as OrderStatus | undefined,
        }
      : undefined;
    return orderService.listOrders(sanitizedFilters);
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return createSafeResponse(async () => {
    const session = await requireAdmin();
    const actorId = session.user.id ? Number(session.user.id) : undefined;
    return orderService.updateOrderStatus(orderId, status, actorId);
  });
}
