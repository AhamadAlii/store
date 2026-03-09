"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProduct } from "@/lib/actions/product.actions";

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [inStock, setInStock] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name is required.";
    if (!price || Number(price) <= 0) newErrors.price = "Price must be greater than 0.";
    if (stockQuantity !== "" && Number(stockQuantity) < 0) newErrors.stockQuantity = "Stock cannot be negative.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select an image file." }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 5MB." }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setAlert(null);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("stockQuantity", stockQuantity || "0");
    formData.append("inStock", String(inStock));
    if (imageBase64) {
      formData.append("image", imageBase64);
    }

    const res = await createProduct(formData);

    if (res.success) {
      setAlert({ type: "success", message: "Product created successfully! Redirecting…" });
      setTimeout(() => router.push("/admin/products"), 1500);
    } else {
      setAlert({ type: "error", message: res.error });
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Add New Product</h1>
      </div>

      {alert && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {alert.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="e.g. Stainless Steel Spatula"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-vertical"
              placeholder="Brief description of the product"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                  errors.price ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                id="stockQuantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                  errors.stockQuantity ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.stockQuantity && <p className="text-xs text-red-600 mt-1">{errors.stockQuantity}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="inStock"
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
            />
            <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
              Available (In Stock)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  <p className="text-xs text-gray-500">Click to change image</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm">Click to upload an image</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating…" : "Create Product"}
          </button>
          <Link
            href="/admin/products"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
