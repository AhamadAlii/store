"use client";

import { useState, FormEvent } from "react";
import { getOrderTracking } from "@/lib/actions/order.actions";

const STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED"] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready for Pickup",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
  };
}

interface Order {
  id: string;
  phone: string;
  status: string;
  total: number;
  tokenAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  createdAt: string | Date;
  items: OrderItem[];
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const isCancelled = currentStatus === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-6 py-4 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUSES.indexOf(currentStatus as typeof STATUSES[number]);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        {STATUSES.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={status} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      index <= currentIndex ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? "bg-green-500 ring-4 ring-green-100 dark:ring-green-900/50"
                      : isCompleted
                      ? "bg-green-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                  )}
                </div>
                {index < STATUSES.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      index < currentIndex ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
              <p
                className={`mt-2 text-xs text-center font-medium ${
                  isActive
                    ? "text-green-700 dark:text-green-400"
                    : isCompleted
                    ? "text-green-600 dark:text-green-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {STATUS_LABELS[status]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackPage() {
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);

    const trimmedPhone = phone.trim();
    const trimmedOrderId = orderId.trim();

    if (!trimmedPhone || !trimmedOrderId) {
      setError("Please enter both phone number and order ID.");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const result = await getOrderTracking(trimmedPhone, trimmedOrderId);

      if (result.success) {
        setOrder(result.data as unknown as Order);
      } else {
        setError(
          result.error || "Order not found. Please check your details."
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight mb-8 text-gray-900 dark:text-white">
        Track Your Order
      </h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="orderId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Order ID
            </label>
            <input
              id="orderId"
              type="text"
              placeholder="e.g. ORD-1234567890"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Searching...
            </span>
          ) : (
            "Track Order"
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* No Result */}
      {searched && !loading && !order && !error && (
        <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm py-8">
          No order found. Please check your phone number and order ID.
        </div>
      )}

      {/* Order Details */}
      {order && (
        <div className="mt-8 space-y-6">
          {/* Order Header */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-950">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Order {order.id}</h2>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  order.status === "DELIVERED"
                    ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                    : order.status === "CANCELLED"
                    ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                    : order.status === "READY"
                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                    : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400"
                }`}
              >
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {/* Timeline */}
            <StatusTimeline currentStatus={order.status} />
          </div>

          {/* Items */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Items Ordered
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-950">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-950 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Payment Summary
              </h3>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  order.paymentStatus === "PAID"
                    ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                    : order.paymentStatus === "FAILED"
                    ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                    : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400"
                }`}
              >
                {order.paymentStatus === "PAID"
                  ? "Paid"
                  : order.paymentStatus === "FAILED"
                  ? "Failed"
                  : "Awaiting Payment"}
              </span>
            </div>

            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>

            <div className="flex justify-between text-green-700 dark:text-green-400">
              <span>Token Amount (18%)</span>
              <span>₹{order.tokenAmount}</span>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-semibold text-gray-900 dark:text-white">
              <span>Remaining (Pay at Store)</span>
              <span>₹{order.remainingAmount}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
