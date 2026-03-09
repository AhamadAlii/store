import Link from "next/link";

export default function BrowseButton() {
  return (
    <div className="text-center pb-20">
      <Link
        href="/items"
        className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition"
      >
        Browse Items
      </Link>
    </div>
  );
}
