"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import ProductToolbar, { type SortOption } from "./ProductToolbar";
import ProductCard, { type Product } from "./ProductCard";
import { cn } from "@/src/lib/utils";
import { useAddToCart } from "@/src/api/useCart";

const SORT_OPTIONS: SortOption[] = [
  { value: "relevant", label: "Most Relevant" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const containerPadding = "px-4 sm:px-8 xl:px-12 2xl:px-[227px]";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ProductListingProps {
  className?: string;
  products: Product[];
  priceRange: { min: number; max: number };
  pagination: Pagination;
  basePath: string;
}

export default function ProductListing({
  className,
  products,
  priceRange,
  pagination,
  basePath,
}: ProductListingProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("relevant");
  const [maxPrice, setMaxPrice] = useState(priceRange.max);

  const hasPriceFilter = priceRange.max > priceRange.min;

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((p) => p.price <= maxPrice);
    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, sort, maxPrice]);

  const { mutate: addToCart, isPending: adding } = useAddToCart();

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (adding) return;
      addToCart({ productId: product.id, quantity: 1, name: product.title });
    },
    [adding, addToCart]
  );

  const pageHref = (page: number) => `${basePath}?page=${page}`;

  return (
    <>
      <ProductToolbar
        filtersOpen={filtersOpen}
        onShowFilters={() => setFiltersOpen((v) => !v)}
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={setSort}
      />

      <section
        data-slot="product-listing"
        className={cn("w-full bg-white pb-12 sm:pb-16 2xl:pb-20", containerPadding, className)}
      >
        <div className="mx-auto w-full max-w-[1464px]">
          {filtersOpen && (
            <div className="mb-5 2xl:mb-[27px]">
              {hasPriceFilter ? (
                <label className="flex max-w-sm flex-col gap-2 text-[14px] font-semibold sm:text-[16px]">
                  <span>
                    Max price: AED {maxPrice.toFixed(2)}{" "}
                    <span className="font-normal text-[#525252]">
                      (AED {priceRange.min} – {priceRange.max})
                    </span>
                  </span>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step={1}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="accent-[#542452]"
                  />
                </label>
              ) : (
                <p className="text-[14px] text-[#525252]">No filters available for this category.</p>
              )}
            </div>
          )}

          {visibleProducts.length > 0 ? (
            <ul
              className={cn(
                "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4",
                "2xl:gap-x-[21px] 2xl:gap-y-[27px]"
              )}
            >
              {visibleProducts.map((product) => (
                <li key={product.id} className="flex">
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-16 text-center text-[16px] text-[#525252]">No products found in this category.</p>
          )}

          {pagination.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
              {pagination.hasPreviousPage ? (
                <Link href={pageHref(pagination.page - 1)} className="rounded-full border-2 border-black px-5 py-2 font-semibold">
                  Previous
                </Link>
              ) : (
                <span className="rounded-full border-2 border-black/20 px-5 py-2 font-semibold text-black/30">Previous</span>
              )}
              <span className="text-[14px] sm:text-[16px]">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              {pagination.hasNextPage ? (
                <Link href={pageHref(pagination.page + 1)} className="rounded-full border-2 border-black px-5 py-2 font-semibold">
                  Next
                </Link>
              ) : (
                <span className="rounded-full border-2 border-black/20 px-5 py-2 font-semibold text-black/30">Next</span>
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}

export const ProductListingSkeleton = () => (
  <section className={cn("w-full bg-white pb-12", containerPadding)}>
    <div className="mx-auto grid w-full max-w-[1464px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-[380px] animate-pulse rounded-lg bg-black/10" />
      ))}
    </div>
  </section>
);