"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/src/lib/utils";

import ProductCard, { Product } from "../ProductCard";
import { useAddToCart } from "@/src/api/useCart";

/* ----------------------------- API types ----------------------------- */

interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  compatibleDescription: string;
  compatibleValues: string;
  sellingPrice: number;
  originalPrice: number;
  images: string[];
category: { slug: string } | null; 
}

interface PopularProductsResponse {
  data: { products: ApiProduct[] };
}

/* ------------------- fetch + discount + mapper (once) ------------------- */

const FALLBACK_IMAGE = "/products/placeholder.png";

const calcDiscount = (selling: number, original: number) =>
  original > 0 && original > selling
    ? Math.round(((original - selling) / original) * 100)
    : 0;

const fetchPopularProducts = async (): Promise<PopularProductsResponse> => {
  // replace with your existing API client / endpoint
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products/popular`);
  console.log(res,'res');
  
  if (!res.ok) throw new Error("Failed to fetch popular products");
  return res.json();
};

// Outside the component => stable reference, runs only when new data arrives
const mapProducts = ({ data }: PopularProductsResponse): Product[] =>
  data.products.map((p) => {
    const discount = calcDiscount(p.sellingPrice, p.originalPrice);
    return {
      id: p._id,
      title: p.name,
      compatibleFor: p.compatibleDescription,
      models: p.compatibleValues,
      price: p.sellingPrice,
      oldPrice: discount > 0 ? p.originalPrice : undefined,
      discount,
      image: p.images?.[0] ?? FALLBACK_IMAGE,
     category: p.category?.slug ?? "",
      href: `/product/${p.slug}`,
    };
  });

/* ------------------------------ filters ------------------------------ */

const FILTERS = [
  { id: "all", label: "All", category: null },
  { id: "multicolor-toner", label: "Multicolor Toner", category: "multicolor-toner" },
  { id: "toner-cartridge", label: "Toner Cartridge", category: "toner-cartridge" },
  { id: "relevance", label: "Relevance", category: null },
] as const;

const GRID_CLASS =
  "mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:mt-[30px] 2xl:gap-6";

interface PopularProductsProps {
  className?: string;
  products?: Product[];
  /** Called after a product is added to the cart (e.g. open the cart drawer) */
  onAddedToCart?: () => void;
}

const PopularProducts = ({
  className,
  products: productsProp,
  onAddedToCart,
}: PopularProductsProps) => {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const {
    data: apiProducts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["popular-products"],
    queryFn: fetchPopularProducts,
    select: mapProducts,
    staleTime: 5 * 60 * 1000,
    enabled: !productsProp,
  });

  // success / error toasts are handled inside the hook
  const { mutate: addToCart, isPending: adding } = useAddToCart();

  const products = productsProp ?? apiProducts;

  const visibleProducts = useMemo(() => {
    if (!products) return [];
    const filter = FILTERS.find((f) => f.id === activeFilter);
    if (!filter?.category) return products;
    return products.filter((p) => p.category === filter.category);
  }, [activeFilter, products]);
console.log(visibleProducts,'visible');

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (adding) return; // ignore double clicks while a request is running
      addToCart(
        { productId: product.id, quantity: 1, name: product.title },
        { onSuccess: onAddedToCart }
      );
    },
    [adding, addToCart, onAddedToCart]
  );

  const showSkeleton = isLoading && !productsProp;

  return (
    <section
      data-slot="popular-products"
      className={cn(
        "w-full bg-white px-4 pb-12 pt-10 sm:px-8 sm:pb-16 xl:px-12 2xl:px-0",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1464px]">
        {/* Heading + filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          {/* Title block */}
          <div className="shrink-0">
            <p
              className={cn(
                "-mb-1 font-semibold uppercase leading-none tracking-[0%] text-primary",
                "text-[14px] sm:text-[16px] 2xl:text-[18px]"
              )}
            >
              Discover Your Essentials
            </p>
            <h2
              className={cn(
                "mt-1 font-semibold capitalize leading-[100%] tracking-[0%] text-black sm:mt-1.5 2xl:mt-2",
                "text-[28px] sm:text-[36px] md:text-[42px] xl:text-[48px] 2xl:text-[55px]"
              )}
            >
              Popular Products
            </h2>
          </div>

          {/* Filter tabs: the selected one gets the rounded border + shadow */}
          <div
            role="group"
            aria-label="Filter products"
            className={cn(
              "-mx-4 flex min-w-0 items-center gap-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:gap-2 lg:overflow-visible lg:pb-0",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            {FILTERS.map((filter) => {
              const selected = filter.id === activeFilter;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-[22px] border font-semibold capitalize leading-[100%] tracking-[0%] text-black transition-[box-shadow,background-color,border-color] duration-200",
                    "px-3 py-2 text-[14px] sm:px-4 sm:py-2.5 sm:text-[16px] xl:px-5 xl:py-3 xl:text-[18px] 2xl:px-[30px] 2xl:py-4 2xl:text-[22px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    selected
                      ? "border-[#B8B8B8] bg-white shadow-[0_0_4px_0_#00000040]"
                      : "border-transparent bg-transparent hover:border-[#B8B8B8]/60"
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards */}
        {showSkeleton ? (
          <ul className={GRID_CLASS} aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="aspect-[3/4] w-full animate-pulse rounded-[20px] bg-gray-200"
              />
            ))}
          </ul>
        ) : (
          <ul className={GRID_CLASS}>
            {visibleProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </li>
            ))}
          </ul>
        )}

        {isError && (
          <p role="alert" className="mt-8 text-center text-[16px] text-red-600">
            Couldn&apos;t load products. Please try again later.
          </p>
        )}

        {!showSkeleton && !isError && visibleProducts.length === 0 && (
          <p className="mt-8 text-center text-[16px] text-[#525252]">
            No products found in this category.
          </p>
        )}
      </div>
    </section>
  );
};

export default PopularProducts;