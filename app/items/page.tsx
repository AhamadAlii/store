import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { productService } from "@/services/product.service";

interface ItemsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 12;

  const { products, totalPages } = await productService.listProducts(
    currentPage,
    limit
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Browse Utensils</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Find the perfect utensils for your kitchen
        </p>
      </div>

      {products.length === 0 ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-16 text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">No products available</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Check back later for new arrivals.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/items?page=${currentPage - 1}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </Link>
              )}

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Link
                      key={page}
                      href={`/items?page=${page}`}
                      className={`w-10 h-10 inline-flex items-center justify-center text-sm font-medium rounded-lg transition ${
                        page === currentPage
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {page}
                    </Link>
                  )
                )}
              </div>

              {currentPage < totalPages && (
                <Link
                  href={`/items?page=${currentPage + 1}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
                >
                  Next
                  <svg
                    className="w-4 h-4 ml-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
