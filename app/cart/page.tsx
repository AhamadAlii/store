"use client";

import Link from "next/link";
import { useCart } from "@/components/context/CartContext";

export default function CartPage() {
  const { cart, increaseQty, decreaseQty } = useCart();

  // Calculate totals
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tokenAmount = Math.round(total * 0.18);
  const remainingAmount = total - tokenAmount;

  // Empty cart view
  if (cart.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Your cart is empty
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Add some utensils to start booking.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8 text-gray-900 dark:text-white">
        Your Cart
      </h1>

      {/* Cart Items */}
      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900"
          >
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
                >
                  −
                </button>

                <span className="font-medium text-gray-900 dark:text-white">
                  {item.quantity}
                </span>

                <button
                  onClick={() => increaseQty(item.id)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
                >
                  +
                </button>
              </div>
            </div>

            <p className="font-bold text-lg text-gray-900 dark:text-white">
              ₹{item.price * item.quantity}
            </p>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="mt-10 border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-gray-50 dark:bg-gray-900 space-y-3">
        <div className="flex justify-between text-gray-700 dark:text-gray-300">
          <span>Total Amount</span>
          <span>₹{total}</span>
        </div>

        <div className="flex justify-between text-green-700 dark:text-green-400 font-medium">
          <span>Token Amount (18%)</span>
          <span>₹{tokenAmount}</span>
        </div>

        <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
          <span>Pay at Store</span>
          <span>₹{remainingAmount}</span>
        </div>

        <Link
          href="/booking"
          className="block w-full text-center mt-4 bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition"
        >
          Proceed to Booking
        </Link>
      </div>
    </main>
  );
}
