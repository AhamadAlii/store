import { getActiveAnnouncement } from "@/lib/actions/announcement.actions";

export default async function Announcement() {
  const announcement = await getActiveAnnouncement();

  if (!announcement) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
        <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-1">
          {announcement.title}
        </p>
        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
          {announcement.message}
        </p>
      </div>
    </div>
  );
}
