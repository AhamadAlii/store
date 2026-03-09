"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listProducts, deleteProduct, toggleProductStock } from "@/lib/actions/product.actions";
import type { Product } from "@/types/product";

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
    </tr>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await listProducts();
    if (res.success) {
      setProducts(res.data.products);
    } else {
      showAlert("error", res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function showAlert(type: "success" | "error", message: string) {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  }

  async function handleDelete(id: number) {
    setActionLoading(id);
    const res = await deleteProduct(id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showAlert("success", "Product deleted successfully.");
    } else {
      showAlert("error", res.error);
    }
    setActionLoading(null);
    setDeleteConfirm(null);
  }

  async function handleToggleStock(id: number) {
    setActionLoading(id);
    const res = await toggleProductStock(id);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
      );
      showAlert("success", "Stock status updated.");
    } else {
      showAlert("error", res.error);
    }
    setActionLoading(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {alert && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {alert.message}
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === deleteConfirm ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Price</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Stock Qty</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-gray-500 mb-3">No products found.</p>
                    <Link
                      href="/admin/products/new"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Add your first product →
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-lg">
                            📷
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">{product.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{product.stockQuantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStock(product.id)}
                          disabled={actionLoading === product.id}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          {product.inStock ? "Mark OOS" : "Mark In Stock"}
                        </button>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          disabled={actionLoading === product.id}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
