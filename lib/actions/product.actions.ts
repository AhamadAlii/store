"use server";

import { auth } from "@/auth";
import { productService } from "@/services/product.service";
import { uploadImage } from "@/lib/cloudinary";
import { createSafeResponse, AppError } from "@/lib/errors";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new AppError("Forbidden: admin access required", 403, "FORBIDDEN");
  }

  return session;
}

export async function listProducts(page?: number, limit?: number) {
  return createSafeResponse(() => productService.listProducts(page, limit));
}

export async function getProduct(id: number) {
  return createSafeResponse(() => productService.getProduct(id));
}

export async function createProduct(formData: FormData) {
  return createSafeResponse(async () => {
    await requireAdmin();

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) ?? "";
    const price = Number(formData.get("price"));
    const inStock = formData.get("inStock") === "true";
    const stockQuantity = Number(formData.get("stockQuantity") ?? 0);
    const image = formData.get("image") as string | null;

    let imageUrl = "";

    if (image) {
      imageUrl = await uploadImage(image);
    }

    return productService.createProduct({
      name,
      description,
      price,
      imageUrl,
      inStock,
      stockQuantity,
    });
  });
}

export async function updateProduct(id: number, formData: FormData) {
  return createSafeResponse(async () => {
    await requireAdmin();

    const data: Record<string, unknown> = {};

    const name = formData.get("name") as string | null;
    if (name !== null) data.name = name;

    const description = formData.get("description") as string | null;
    if (description !== null) data.description = description;

    const price = formData.get("price");
    if (price !== null) data.price = Number(price);

    const inStock = formData.get("inStock");
    if (inStock !== null) data.inStock = inStock === "true";

    const stockQuantity = formData.get("stockQuantity");
    if (stockQuantity !== null) data.stockQuantity = Number(stockQuantity);

    const image = formData.get("image") as string | null;

    if (image) {
      data.imageUrl = await uploadImage(image);
    }

    return productService.updateProduct(id, data);
  });
}

export async function deleteProduct(id: number) {
  return createSafeResponse(async () => {
    await requireAdmin();
    return productService.deleteProduct(id);
  });
}

export async function toggleProductStock(id: number) {
  return createSafeResponse(async () => {
    await requireAdmin();
    return productService.toggleStock(id);
  });
}
