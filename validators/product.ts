import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().max(2000).default(""),
  price: z.number().int().positive("Price must be a positive integer"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).default(""),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().nonnegative("Stock quantity cannot be negative").default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().int().positive("Price must be a positive integer").optional(),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().int().nonnegative("Stock quantity cannot be negative").optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
