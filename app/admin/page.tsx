"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAnalytics } from "@/lib/actions/admin.actions";
import { listOrders } from "@/lib/actions/order.actions";
import { logoutAction } from "@/lib/actions/auth.actions";
import type { OrderStatus } from "@/types/order";

interface Analytics {
  totalOrders: number;
  revenue: number;
  pendingCount: number;
}

interface RecentOrder {
  id: string;
  phone: string;
  status: OrderStatus;
  total: number;
  createdAt: Date | string;
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
  CONFIRMED: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
  PREPARING: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300",
  READY: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
  DELIVERED: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
  CANCELLED: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
};

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
    </tr>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      const [analyticsRes, ordersRes] = await Promise.all([
        getAnalytics(),
        listOrders({ page: 1, limit: 5 }),
      ]);

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      } else {
        setError(analyticsRes.error);
      }

      if (ordersRes.success) {
        setRecentOrders(ordersRes.data.orders as RecentOrder[]);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAction();
    router.push("/login");
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here&apos;s your store overview.</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          {loggingOut ? "Logging out…" : "Logout"}
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : analytics ? (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.totalOrders}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">₹{analytics.revenue.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{analytics.pendingCount}</p>
            </div>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <Link
          href="/admin/products"
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center text-2xl">📦</div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Manage Products</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, or remove products</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-950/50 rounded-lg flex items-center justify-center text-2xl">🧾</div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Manage Orders</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and update order statuses</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Order ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 dark:text-gray-200">{order.id}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">₹{order.total.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
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
