import { orderRepository } from "@/db/repositories/order.repository";
import { productRepository } from "@/db/repositories/product.repository";
import { auditRepository } from "@/db/repositories/audit.repository";
import { createOrderSchema, updateOrderStatusSchema } from "@/validators/order";
import { AppError } from "@/lib/errors";
import { notificationService } from "@/services/notification.service";
import type { OrderStatus } from "@prisma/client";

const TOKEN_PERCENTAGE = 0.18;

interface CartItem {
  productId: number;
  quantity: number;
}

interface OrderFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

function generateOrderId(): string {
  return `ORD-${Date.now()}`;
}

export const orderService = {
  async createOrder(phone: string, cartItems: CartItem[]) {
    const parsed = createOrderSchema.safeParse({ phone, items: cartItems });

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((e) => e.message).join(", "),
        400,
        "VALIDATION_ERROR"
      );
    }

    const { items } = parsed.data;

    const orderItems: { productId: number; quantity: number; price: number }[] = [];
    let total = 0;

    for (const item of items) {
      const product = await productRepository.findById(item.productId);

      if (!product) {
        throw new AppError(
          `Product with ID ${item.productId} not found`,
          404,
          "PRODUCT_NOT_FOUND"
        );
      }

      if (!product.inStock) {
        throw new AppError(
          `Product "${product.name}" is out of stock`,
          400,
          "OUT_OF_STOCK"
        );
      }

      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
          400,
          "INSUFFICIENT_STOCK"
        );
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const tokenAmount = Math.round(total * TOKEN_PERCENTAGE);
    const remainingAmount = total - tokenAmount;
    const orderId = generateOrderId();

    const order = await orderRepository.create({
      id: orderId,
      phone: parsed.data.phone,
      total,
      tokenAmount,
      remainingAmount,
      items: orderItems,
    });

    notificationService
      .sendOrderPlaced(parsed.data.phone, orderId, tokenAmount)
      .then((sent) => {
        if (sent) orderRepository.markNotified(orderId);
      })
      .catch(console.error);

    return order;
  },

  async getOrderTracking(phone: string, orderId: string) {
    if (!phone || !orderId) {
      throw new AppError(
        "Phone number and order ID are required",
        400,
        "VALIDATION_ERROR"
      );
    }

    const order = await orderRepository.findByPhoneAndId(phone, orderId);

    if (!order) {
      throw new AppError(
        "Order not found. Please check your phone number and order ID.",
        404,
        "ORDER_NOT_FOUND"
      );
    }

    return order;
  },

  async listOrders(filters?: OrderFilters) {
    return orderRepository.findAll(filters);
  },

  async updateOrderStatus(
    orderId: string,
    status: string,
    actorId?: number
  ) {
    const parsed = updateOrderStatusSchema.safeParse({ status });

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((e) => e.message).join(", "),
        400,
        "VALIDATION_ERROR"
      );
    }

    const existing = await orderRepository.findById(orderId);

    if (!existing) {
      throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
    }

    if (existing.status === "DELIVERED" || existing.status === "CANCELLED") {
      throw new AppError(
        `Cannot update order with status "${existing.status}"`,
        400,
        "INVALID_STATUS_TRANSITION"
      );
    }

    const updatedOrder = await orderRepository.updateStatus(
      orderId,
      parsed.data.status
    );

    await auditRepository.create(
      "ORDER_STATUS_UPDATED",
      actorId ?? null,
      "Order",
      `Order ${orderId} status changed from ${existing.status} to ${parsed.data.status}`
    );

    notificationService
      .sendStatusUpdate(existing.phone, orderId, parsed.data.status)
      .catch(console.error);

    return updatedOrder;
  },
};
