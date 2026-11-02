"use client";

import { useMemo, useState } from "react";
import ProductToolbar, { type SortOption } from "./ProductToolbar";
import ProductCard, { type Product } from "./ProductCard";
import { cn } from "@/src/lib/utils";
import BlackTonerCartridge from "../../../public/products/blacktonercartridge.png";
import PaperFeedRoller from "../../../public/products/paperfeedroller.png";
import CyanTonerCartridge from "../../../public/products/cyantonercartridge.png";
import PCR from "../../../public/products/pcr.png";
import MagentaTonerCartridge from "../../../public/products/magentatonercartridge.png";
import TransferBelt from "../../../public/products/transferbelt.png";

const SORT_OPTIONS: SortOption[] = [
  { value: "relevant", label: "Most Relevant" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Black Toner Cartiage",
    compatibleFor: "Compatible For Canon IR:",
    models: "4525i/ 4535i/ 4545i 4725 (CEXV53)",
    price: 105,
    oldPrice: 120,
    discount: 5,
    image: BlackTonerCartridge,
    category: "toner-cartridge",
  },
  {
    id: "p2",
    title: "Paper Feed Roller",
    compatibleFor: "Compatible For Canon :",
    models: "5235/ 2525",
    price: 10,
    oldPrice: 15,
    discount: 5,
    image: PaperFeedRoller,
    category: "accessories",
  },
  {
    id: "p3",
    title: "Cyan Toner Cartiage",
    compatibleFor: "Compatible For Canon IR:",
    models: "250i/ 255/ 350i/ 351fi (NPG-65)",
    price: 96.43,
    oldPrice: 100,
    discount: 5,
    image: CyanTonerCartridge,
    category: "multicolor-toner",
  },
  {
    id: "p4",
    title: "Black Toner Cartiage",
    compatibleFor: "Compatible For Canon IR:",
    models: "250i/ 255/ 350i/ 351fi (NPG-65)",
    price: 96.43,
    oldPrice: 100,
    discount: 5,
    image: BlackTonerCartridge,
    category: "toner-cartridge",
  },
  {
    id: "p5",
    title: "PCR (Highyield)",
    compatibleFor: "Compatible For Canon IRC:",
    models: "5535/ 5560/ 5550/ 5540/ 5750",
    price: 35,
    oldPrice: 40,
    discount: 5,
    image: PCR,
    category: "accessories",
  },
  {
    id: "p6",
    title: "Magenta Toner Cartiage",
    compatibleFor: "Compatible For Canon IRC:",
    models: "250i/ 255/ 350i/ 351fi (NPG-65)",
    price: 96.43,
    oldPrice: 100,
    discount: 5,
    image: MagentaTonerCartridge,
    category: "multicolor-toner",
  },
  {
    id: "p7",
    title: "Black Toner Cartiage",
    compatibleFor: "Compatible For Canon IR:",
    models: "4525i/ 4535i/ 4545i 4725 (CEXV53)",
    price: 105,
    oldPrice: 120,
    discount: 5,
    image: BlackTonerCartridge,
    category: "toner-cartridge",
  },
  {
    id: "p8",
    title: "Transfer Belt",
    compatibleFor: "Compatible For Canon :",
    models: "3525/ 3530/ G65",
    price: 8.57,
    oldPrice: 12.57,
    discount: 5,
    image: TransferBelt,
    category: "accessories",
  },
];

const FILTERS = [
  { id: "all", label: "All", category: null },
  { id: "multicolor-toner", label: "Multicolor Toner", category: "multicolor-toner" },
  { id: "toner-cartridge", label: "Toner Cartridge", category: "toner-cartridge" },
  { id: "accessories", label: "Accessories", category: "accessories" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const containerPadding = "px-4 sm:px-8 xl:px-12 2xl:px-[227px]";

interface ProductListingProps {
  className?: string;
  products?: Product[];
}

export default function ProductListing({ className, products = PRODUCTS }: ProductListingProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("relevant");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const visibleProducts = useMemo(() => {
    const filter = FILTERS.find((f) => f.id === activeFilter);
    const filtered = filter?.category ? products.filter((p) => p.category === filter.category) : products;

    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [activeFilter, sort, products]);

  const handleAddToCart = (product: Product) => {
    console.log("Add to cart:", product.id);
  };

  return (
    <>
      <ProductToolbar
        filtersOpen={filtersOpen}
        onShowFilters={() => setFiltersOpen((v) => !v)}
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={setSort}
      />

      <section data-slot="product-listing" className={cn("w-full bg-white pb-12 sm:pb-16 2xl:pb-20", containerPadding, className)}>
        <div className="mx-auto w-full max-w-[1464px]">
          {/* Filter chips: shown when "Show Filters" is open */}
          {filtersOpen && (
            <div role="group" aria-label="Filter products" className="mb-5 flex flex-wrap gap-2 sm:gap-3 2xl:mb-[27px]">
              {FILTERS.map((filter) => {
                const isActive = filter.id === activeFilter;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      "rounded-full border-2 px-4 py-2 text-[14px] font-semibold leading-[100%] transition-colors sm:px-5 sm:text-[16px]",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#542452]",
                      isActive
                        ? "border-[#542452] bg-[#542452] text-white"
                        : "border-black bg-white text-black hover:bg-black/5"
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
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
        </div>
      </section>
    </>
  );
}