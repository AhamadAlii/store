import { productRepository } from "@/db/repositories/product.repository";
import { createProductSchema, updateProductSchema } from "@/validators/product";
import { AppError } from "@/lib/errors";

export const productService = {
  async listProducts(page: number = 1, limit: number = 20) {
    return productRepository.findAll(page, limit);
  },

  async getProduct(id: number) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    return product;
  },

  async createProduct(data: unknown) {
    const parsed = createProductSchema.safeParse(data);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((e) => e.message).join(", "),
        400,
        "VALIDATION_ERROR"
      );
    }

    return productRepository.create(parsed.data);
  },

  async updateProduct(id: number, data: unknown) {
    const parsed = updateProductSchema.safeParse(data);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((e) => e.message).join(", "),
        400,
        "VALIDATION_ERROR"
      );
    }

    const existing = await productRepository.findById(id);

    if (!existing) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    return productRepository.update(id, parsed.data);
  },

  async deleteProduct(id: number) {
    const existing = await productRepository.findById(id);

    if (!existing) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    return productRepository.delete(id);
  },

  async toggleStock(id: number) {
    const existing = await productRepository.findById(id);

    if (!existing) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    return productRepository.updateStock(
      id,
      existing.stockQuantity,
      !existing.inStock
    );
  },
};
