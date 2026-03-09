"use client";

import { useEffect, useState } from "react";
import {
  createAnnouncement,
  dismissAnnouncement,
  getActiveAnnouncement,
} from "@/lib/actions/announcement.actions";

interface Announcement {
  id: number;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: Date | string;
}

export default function AnnouncementsPage() {
  const [current, setCurrent] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchCurrent() {
    setLoading(true);
    const announcement = await getActiveAnnouncement();
    setCurrent(announcement);
    setLoading(false);
  }

  useEffect(() => {
    fetchCurrent();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const result = await createAnnouncement(title, message);

    if (result.success) {
      setSuccess("Announcement published successfully!");
      setTitle("");
      setMessage("");
      await fetchCurrent();
    } else {
      setError(result.error || "Failed to create announcement");
    }

    setSubmitting(false);
  }

  async function handleDismiss() {
    setError("");
    setSuccess("");
    setDismissing(true);

    const result = await dismissAnnouncement();

    if (result.success) {
      setSuccess("Announcement dismissed.");
      setCurrent(null);
    } else {
      setError(result.error || "Failed to dismiss announcement");
    }

    setDismissing(false);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-sm text-gray-500 mt-1">
          Push important updates to all users on the homepage.
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Active Announcement */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Current Announcement</h2>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ) : current ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-1">
                  {current.title}
                </p>
                <p className="text-yellow-800 font-medium">{current.message}</p>
                <p className="text-xs text-yellow-500 mt-2">
                  Published{" "}
                  {new Date(current.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                disabled={dismissing}
                className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {dismissing ? "Dismissing…" : "Dismiss Announcement"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active announcement right now.</p>
          )}
        </div>

        {/* Create New Announcement */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Push New Announcement</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Store Update"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Store will be closed on Sunday for maintenance."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {submitting ? "Publishing…" : "Publish Announcement"}
            </button>

            <p className="text-xs text-gray-400">
              Publishing a new announcement will replace any existing active announcement.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
