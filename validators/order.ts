import { z } from "zod";

const cartItemSchema = z.object({
  productId: z.number().int().positive("Product ID must be a positive integer"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number format"),
  items: z
    .array(cartItemSchema)
    .min(1, "Order must contain at least one item"),
  tokenAmount: z
    .number()
    .int()
    .nonnegative("Token amount cannot be negative")
    .default(0),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
]);

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
