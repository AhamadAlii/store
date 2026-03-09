"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

function OrderSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const isPaid = searchParams.get("paid") === "true";

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Confetti-like decorative dots */}
        <div className="relative mb-6">
          <div className="absolute -top-4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="absolute -top-6 left-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="absolute -top-3 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          <div className="absolute -top-5 right-1/4 w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "450ms" }} />
          <div className="absolute -top-2 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />

          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Your order has been received and is being processed.
        </p>

        {/* Order ID */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-gray-50 dark:bg-gray-900 mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Order ID</p>
          <p className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
            {orderId}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Save this ID to track your order
          </p>
        </div>

        {/* Info Box */}
        {isPaid ? (
          <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 rounded-xl p-4 mb-8 text-left">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Payment Received!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your token payment has been confirmed. The remaining amount is payable at the store during pickup.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/40 rounded-xl p-4 mb-8 text-left">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  What&apos;s next?
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Complete the token payment (18%) to confirm your order. The remaining amount is payable at the store during pickup.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/track`}
            className="flex-1 inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            Track Order
          </Link>
          <Link
            href="/items"
            className="flex-1 inline-flex items-center justify-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  );
}
