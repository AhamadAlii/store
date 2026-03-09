const steps = [
  "Browse utensils online",
  "Pay 18% token online",
  "Store prepares your order",
  "Pick up within 24 hours",
];

export default function HowPickupWorks() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-semibold text-center mb-10 text-gray-900 dark:text-white">
        How Pickup Works
      </h2>

      <div className="grid gap-6 md:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center bg-white dark:bg-gray-900 shadow-sm"
          >
            <div className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              {index + 1}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
