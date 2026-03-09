"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/context/CartContext";
import type { RazorpayOptions, RazorpayResponse } from "@/types/razorpay";

interface OrderPaymentData {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export default function BookingPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [orderData, setOrderData] = useState<OrderPaymentData | null>(null);
  const [paymentDismissed, setPaymentDismissed] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tokenAmount = Math.round(total * 0.18);
  const remainingAmount = total - tokenAmount;

  if (cart.length === 0 && !orderData) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-12 bg-white dark:bg-gray-900">
          <div className="text-5xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Your cart is empty</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add some items before placing an order.
          </p>
          <Link
            href="/items"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            Browse Items
          </Link>
        </div>
      </main>
    );
  }

  function openRazorpayCheckout(data: OrderPaymentData) {
    if (typeof window === "undefined" || !window.Razorpay) {
      setError("Payment gateway is loading. Please try again in a moment.");
      setLoading(false);
      return;
    }

    const options: RazorpayOptions = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "Utensil Store",
      description: `Token payment for order ${data.orderId}`,
      order_id: data.razorpayOrderId,
      handler: async (response: RazorpayResponse) => {
        await handlePaymentSuccess(data.orderId, response);
      },
      prefill: { contact: phone },
      theme: { color: "#000000" },
      modal: {
        ondismiss: () => {
          setPaymentDismissed(true);
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  async function handlePaymentSuccess(
    orderId: string,
    response: RazorpayResponse
  ) {
    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const result = await res.json();

      if (result.success) {
        clearCart();
        router.push(`/order/${orderId}?paid=true`);
      } else {
        setError(result.error || "Payment verification failed. Please contact support.");
      }
    } catch {
      setError("Payment verification failed. Please contact support.");
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPaymentDismissed(false);

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    if (orderData) {
      openRazorpayCheckout(orderData);
      return;
    }

    try {
      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmedPhone, items }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      const data: OrderPaymentData = result;
      setOrderData(data);
      openRazorpayCheckout(data);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function handleRetryPayment() {
    if (!orderData) return;
    setError("");
    setPaymentDismissed(false);
    setLoading(true);
    openRazorpayCheckout(orderData);
  }

  const isProcessing = loading || verifying;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight mb-8 text-gray-900 dark:text-white">
        Confirm Booking
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Order Summary */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Order Summary
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-950">
            {cart.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
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
        <div className="mt-6 border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-950 space-y-3">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4">
            Payment Details
          </h2>

          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>

          <div className="flex justify-between text-green-700 dark:text-green-400">
            <span>Token Amount (18%)</span>
            <span>₹{tokenAmount}</span>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-semibold text-gray-900 dark:text-white">
            <span>Remaining (Pay at Store)</span>
            <span>₹{remainingAmount}</span>
          </div>
        </div>

        {/* Phone Input */}
        <div className="mt-6">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
            disabled={isProcessing || !!orderData}
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            You&apos;ll need this number to track your order.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Payment Dismissed Notice */}
        {paymentDismissed && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-3">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Payment was not completed
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Your order has been created. Click below to complete payment.
            </p>
            <button
              type="button"
              onClick={handleRetryPayment}
              disabled={isProcessing}
              className="mt-3 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50"
            >
              Retry Payment
            </button>
          </div>
        )}

        {/* Verifying State */}
        {verifying && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-blue-600 dark:text-blue-400"
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
            <span className="text-sm text-blue-700 dark:text-blue-300">Verifying payment...</span>
          </div>
        )}

        {/* Submit */}
        {!paymentDismissed && (
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
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
                Processing...
              </span>
            ) : (
              `Pay Token ₹${tokenAmount}`
            )}
          </button>
        )}
      </form>
    </main>
  );
}
