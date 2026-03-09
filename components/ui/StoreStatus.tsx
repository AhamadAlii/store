export default function StoreStatus() {
  const isOpen = true; // later from backend

  return (
    <div className="flex justify-center mt-6">
      <span
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          isOpen
            ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
            : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
        }`}
      >
        {isOpen ? "Store Open Now" : "Store Closed"}
      </span>
    </div>
  );
}
