"use client";

import Link from "next/link";
import { useCart } from "@/components/context/CartContext";

export default function Navbar() {
  const { cart } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Store Name */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition">
            Utensil Store
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">

          {/* Browse */}
          <Link
            href="/items"
            className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            Browse
          </Link>

          {/* Track */}
          <Link
            href="/track"
            className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            Track Order
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition flex items-center gap-1.5"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>

            Cart

            {totalItems > 0 && (
              <span className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
                {totalItems}
              </span>
            )}
          </Link>

          {/* ADMIN LOGIN BUTTON */}
          <Link
            href="/login"
            className="ml-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition"
          >
            Admin
          </Link>

        </div>
      </div>
    </nav>
  );
}
