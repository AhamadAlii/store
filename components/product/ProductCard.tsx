"use client";

import { Product } from "@/types/product";
import { useCart } from "@/components/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const hasImage = product.imageUrl && product.imageUrl.trim() !== "";

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow duration-200 group">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {product.inStock ? (
            <span className="bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full">
              In Stock
            </span>
          ) : (
            <span className="bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-300 text-xs font-semibold px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}

        <p className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
          ₹{product.price}
        </p>

        <button
          onClick={() => addToCart(product)}
          disabled={!product.inStock}
          className="mt-4 w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
