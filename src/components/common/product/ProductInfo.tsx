"use client";

import { useState } from "react";
import { ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import payment from "../../../../public/icons/payment.png";
import { ProductDetail } from "@/src/api/products";
import { cn } from "@/src/lib/utils";

const fmt = (v: number) => `AED. ${v.toFixed(2)}`;
const primaryBtn =
  "h-[60px] rounded-[10px] bg-[#542452] px-[30px] py-[10px] text-[18px] font-semibold uppercase leading-[100%] text-white transition-colors hover:bg-[#6E2D6B] disabled:cursor-not-allowed disabled:opacity-50 sm:text-[20px] 2xl:text-[24px]";

export default function ProductInfo({ product }: { product: ProductDetail }) {
  const [qty, setQty] = useState(1);
  const { fullTitle, features, price, oldPrice, discount, inStock, stock } = product;
  const total = Math.round(price * qty * 100) / 100;

  const handleAddToCart = () => console.log("Add to cart:", product.id, qty);
  const handleBuyNow = () => console.log("Buy now:", product.id, qty);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="break-words text-[32px] font-semibold capitalize leading-[150%] tracking-[0.09em] text-black sm:text-[44px] 2xl:text-[60px]">
        {fullTitle}
      </h1>

      {features.length > 0 && (
        <ul className="mb-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-[14px] font-normal uppercase leading-[100%] text-[#515151] sm:text-[16px] 2xl:text-[18px]"
            >
              <span className="size-1 shrink-0 rounded-full bg-[#515151]" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Stock pill + price */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* Stock pill: green when available, red when stock <= 0 */}
<span
  className={cn(
    "inline-flex h-[59px] items-center gap-[10px] rounded-[40px] border px-5 py-3 text-[16px] font-normal capitalize leading-[100%] sm:text-[18px] 2xl:text-[22px]",
    inStock
      ? "border-[#30FF25] bg-[#D3FFD0] text-[#056200]"
      : "border-[#FF2525] bg-[#FFD0D0] text-[#8A0000]"
  )}
>
  <span
    className={cn(
      "size-3 rounded-full border-2",
      inStock ? "border-[#056200]" : "border-[#8A0000]"
    )}
    aria-hidden
  />
  {inStock ? "In stock, ready to ship" : "No stock found"}
</span>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {!!discount && (
            <span className="inline-flex items-center text-[20px] font-semibold capitalize text-[#056200] 2xl:text-[25px]">
              <ArrowDown className="size-5" aria-hidden /> {discount}%
            </span>
          )}
          <span className="text-[20px] font-semibold capitalize leading-[100%] text-black 2xl:text-[25px]">
            {fmt(price)}
          </span>
          {oldPrice && (
            <span className="text-[16px] font-normal capitalize leading-[100%] text-[#464646] line-through 2xl:text-[18px]">
              {fmt(oldPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Qty + Add to cart */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="inline-flex h-[60px] w-[128px] shrink-0 items-center justify-between rounded-[10px] border border-[#AAAAAA] px-4">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-[18px] font-medium" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            // can't order more than what's in stock
            onClick={() => setQty((q) => Math.min(Math.max(stock, 1), q + 1))}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`${primaryBtn} flex-1`}
        >
          Add to cart - {total} AED
        </button>
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={!inStock}
        className={`${primaryBtn} flex w-full items-center justify-center gap-3`}
      >
        Buy now
        <Image
          src={payment}
          alt="Google Pay, PhonePe and Paytm accepted"
          width={88}
          height={34}
          className="h-[28px] w-auto sm:h-[34px]"
        />
      </button>
    </div>
  );
}