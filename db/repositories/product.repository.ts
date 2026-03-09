import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  inStock: true,
  stockQuantity: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export const productRepository = {
  async findAll(page: number = DEFAULT_PAGE, limit: number = DEFAULT_LIMIT) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        select: productSelect,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count(),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });
  },

  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
      select: productSelect,
    });
  },

  async update(id: number, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      select: productSelect,
    });
  },

  async delete(id: number) {
    return prisma.product.delete({
      where: { id },
    });
  },

  async updateStock(id: number, quantity: number, inStock: boolean) {
    return prisma.product.update({
      where: { id },
      data: {
        stockQuantity: quantity,
        inStock,
      },
      select: productSelect,
    });
  },

  async decrementStock(id: number, quantity: number) {
    return prisma.product.update({
      where: { id },
      data: {
        stockQuantity: { decrement: quantity },
      },
      select: productSelect,
    });
  },
};
