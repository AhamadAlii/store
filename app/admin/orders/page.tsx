"use client";

import { useEffect, useState, useCallback } from "react";
import { listOrders, updateOrderStatus } from "@/lib/actions/order.actions";
import type { OrderStatus } from "@/types/order";

/* ================= TYPES ================= */

interface OrderProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

interface OrderItem {
  id: number;
  orderId: string;
  productId: number;
  quantity: number;
  price: number;
  product: OrderProduct;
}

type PaymentStatus = "PENDING" | "PAID" | "FAILED";

interface Order {
  id: string;
  phone: string;
  status: OrderStatus;
  total: number;
  tokenAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: Date | string;
  items: OrderItem[];
}

/* ================= CONSTANTS ================= */

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
];

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
  CONFIRMED: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
  PREPARING: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300",
  READY: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
  DELIVERED: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
  CANCELLED: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
};

const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const transitionButtonStyles: Record<OrderStatus, string> = {
  CONFIRMED: "bg-blue-600 hover:bg-blue-700 text-white",
  PREPARING: "bg-orange-500 hover:bg-orange-600 text-white",
  READY: "bg-green-600 hover:bg-green-700 text-white",
  DELIVERED: "bg-gray-700 hover:bg-gray-800 text-white",
  CANCELLED:
    "bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  PENDING: "",
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  PENDING: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
  PAID: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
  FAILED: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Unpaid",
  PAID: "Paid",
  FAILED: "Failed",
};

/* ================= SKELETON ================= */

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
    </tr>
  );
}

/* ================= MOBILE ORDER CARD ================= */

function OrderCard({
  order,
  isExpanded,
  updatingOrder,
  onToggle,
  onStatusUpdate,
}: {
  order: Order;
  isExpanded: boolean;
  updatingOrder: string | null;
  onToggle: () => void;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
}) {
  const transitions = statusTransitions[order.status];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-xs font-medium text-gray-900 dark:text-gray-200">{order.id}</p>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{order.phone}</span>
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${paymentStatusColors[order.paymentStatus]}`}>
              {paymentStatusLabels[order.paymentStatus]}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {new Date(order.createdAt).toLocaleString("en-IN")}
        </p>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-950 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 items-center text-sm">
              {item.product.imageUrl && (
                <img src={item.product.imageUrl} className="w-8 h-8 rounded object-cover" />
              )}
              <span className="text-gray-700 dark:text-gray-300">{item.product.name} × {item.quantity}</span>
            </div>
          ))}
          {transitions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {transitions.map((status) => (
                <button
                  key={status}
                  disabled={updatingOrder === order.id}
                  onClick={() => onStatusUpdate(order.id, status)}
                  className={`px-3 py-1.5 text-xs rounded font-medium ${transitionButtonStyles[status]}`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= PAGE ================= */

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ---------- Alert ---------- */

  function showAlert(type: "success" | "error", message: string) {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  }

  /* ---------- Fetch Orders ---------- */

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    const filters: Record<string, string | number> = { page, limit: 20 };
    if (statusFilter !== "ALL") filters.status = statusFilter;

    const res = await listOrders(filters);

    if (res.success) {
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
    } else {
      showAlert("error", res.error);
    }

    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ---------- Status Update ---------- */

  async function handleStatusUpdate(orderId: string, newStatus: OrderStatus) {
    setUpdatingOrder(orderId);

    const res = await updateOrderStatus(orderId, newStatus);

    if (res.success) {
      showAlert("success", `Order updated to ${newStatus}`);
      await fetchOrders();
    } else {
      showAlert("error", res.error);
    }

    setUpdatingOrder(null);
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleString("en-IN");
  }

  /* ================= UI ================= */

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Orders</h1>

      {alert && (
        <div className={`mb-4 p-3 rounded text-sm ${
          alert.type === "success"
            ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"
            : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
        }`}>
          {alert.message}
        </div>
      )}

      {/* FILTERS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            statusFilter === "ALL"
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
              : "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          ALL
        </button>

        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              statusFilter === s
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* MOBILE CARDS VIEW */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No orders found.</div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedOrder === order.id}
              updatingOrder={updatingOrder}
              onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="w-8"></th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Order</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Payment</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrder === order.id;
                const transitions = statusTransitions[order.status];

                return (
                  <>
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order.id)
                      }
                    >
                      <td className="px-4 text-gray-500 dark:text-gray-400">{isExpanded ? "▼" : "▶"}</td>

                      <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-gray-200">
                        {order.id}
                      </td>

                      <td className="px-4 text-gray-700 dark:text-gray-300">{order.phone}</td>

                      <td className="px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="px-4 text-right text-gray-900 dark:text-white">
                        ₹{order.total.toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${paymentStatusColors[order.paymentStatus]}`}>
                          {paymentStatusLabels[order.paymentStatus]}
                        </span>
                      </td>

                      <td className="px-4 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>

                      <td
                        className="px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          {transitions.map((status) => (
                            <button
                              key={status}
                              disabled={updatingOrder === order.id}
                              onClick={() =>
                                handleStatusUpdate(order.id, status)
                              }
                              className={`px-2 py-1 text-xs rounded font-medium ${
                                transitionButtonStyles[status]
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${order.id}-expanded`} className="bg-gray-50 dark:bg-gray-950">
                        <td colSpan={8} className="p-4">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-3 items-center mb-2 text-gray-700 dark:text-gray-300"
                            >
                              {item.product.imageUrl && (
                                <img
                                  src={item.product.imageUrl}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              {item.product.name} × {item.quantity}
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
