"use client";

import { useMemo, useState } from "react";
import { cn } from "@/src/lib/utils";
import BlackTonerCartridge from "../../../../public/products/blacktonercartridge.png";
import PaperFeedRoller from "../../../../public/products/paperfeedroller.png";
import CyanTonerCartridge from "../../../../public/products/cyantonercartridge.png";
import PCR from "../../../../public/products/pcr.png";
import MagentaTonerCartridge from "../../../../public/products/magentatonercartridge.png";
import TransferBelt from "../../../../public/products/transferbelt.png";
import ProductCard, { Product } from "../ProductCard";

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
    title: "Papper Feed Roller",
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
  { id: "relevance", label: "Relevance", category: null },
] as const;

interface PopularProductsProps {
  className?: string;
  products?: Product[];
}

const PopularProducts = ({ className, products = PRODUCTS }: PopularProductsProps) => {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const visibleProducts = useMemo(() => {
    const filter = FILTERS.find((f) => f.id === activeFilter);
    if (!filter?.category) return products;
    return products.filter((p) => p.category === filter.category);
  }, [activeFilter, products]);

  const handleAddToCart = (product: Product) => {
    console.log("Add to cart:", product.id);
  };

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
    "-mb-1  font-semibold uppercase leading-none tracking-[0%] text-primary",
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
            "shrink-0 whitespace-nowrap rounded-[22px] border  font-semibold capitalize leading-[100%] tracking-[0%] text-black transition-[box-shadow,background-color,border-color] duration-200",
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
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:mt-[30px] 2xl:gap-6">
          {visibleProducts.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} onAddToCart={handleAddToCart} />
            </li>
          ))}
        </ul>

        {visibleProducts.length === 0 && (
          <p className="mt-8 text-center  text-[16px] text-[#525252]">
            No products found in this category.
          </p>
        )}
      </div>
    </section>
  );
};

export default PopularProducts;