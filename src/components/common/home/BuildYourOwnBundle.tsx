"use client";

import { useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

// Optional: import your product images and set `image` on the items below
// import InkBottle from "../../../../public/products/inkbottle.png";

interface BundleItem {
  id: string;
  title: string;
  price: number;
  oldPrice: number;
  image?: StaticImageData; // no image = grey placeholder card, as in Figma
}

const BUNDLE_ITEMS: BundleItem[] = [
  { id: "b1", title: "OG 003 Ink Bottle Compatible (4 Colors, 70ml)", price: 549, oldPrice: 1999 },
  { id: "b2", title: "OG 003 Ink Bottle Compatible (4 Colors, 70ml)", price: 549, oldPrice: 1999 },
  { id: "b3", title: "OG 003 Ink Bottle Compatible (4 Colors, 70ml)", price: 549, oldPrice: 1999 },
  { id: "b4", title: "OG 003 Ink Bottle Compatible (4 Colors, 70ml)", price: 549, oldPrice: 1999 },
];

const MIN_ITEMS = 3;
const BUNDLE_DISCOUNT = 0.3;

const formatItemPrice = (value: number) => `Rs. ${value}`;
const formatTotal = (value: number) => `Rs.${value.toFixed(2)} INR`;

interface BuildBundleProps {
  className?: string;
  items?: BundleItem[];
}

const BuildBundle = ({ className, items = BUNDLE_ITEMS }: BuildBundleProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const unlocked = selectedItems.length >= MIN_ITEMS;
  const total = unlocked ? subtotal * (1 - BUNDLE_DISCOUNT) : subtotal;

  const toggleItem = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleAddBundle = () => {
    // TODO: connect to your cart store / API
    console.log("Add bundle to cart:", selectedIds);
  };

  return (
    <section
      data-slot="build-bundle"
      className={cn(
        "w-full bg-white px-4 py-10 sm:px-8 sm:py-14 xl:px-12 2xl:px-0",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1464px]">
        {/* Heading */}
        <p
          className={cn(
            "font-[Poppins] font-semibold uppercase leading-[100%] tracking-[0%] text-[#542452]",
            "text-[14px] sm:text-[16px] 2xl:text-[18px]"
          )}
        >
          Buy Together
        </p>
        <h2
          className={cn(
            "mt-2 font-[Poppins] font-semibold capitalize leading-[100%] tracking-[0%] text-black sm:mt-3",
            "text-[28px] sm:text-[36px] md:text-[42px] xl:text-[48px] 2xl:text-[55px]"
          )}
        >
          Build Your Own Bundle
        </h2>
        <p
          className={cn(
            "mt-3 font-[Poppins] font-normal leading-[100%] tracking-[0.03em] text-[#676767] sm:mt-4",
            "text-[14px] sm:text-[16px] 2xl:text-[18px]"
          )}
        >
          Choose at least three different products and add them together to your cart.
        </p>

        {/* Layout: product cards (left) + bundle panel (right) */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 xl:grid-cols-[850fr_574fr] 2xl:mt-[50px]">
          {/* Product cards: 1 → 2 columns, Figma 425 x 340 */}
          <ul className="grid grid-cols-1 content-start gap-4 sm:grid-cols-2 sm:gap-5 2xl:gap-x-5 2xl:gap-y-[23px]">
            {items.map((item) => {
              const selected = selectedIds.includes(item.id);

              return (
                <li key={item.id} className="flex min-w-0">
                  <article
                    className={cn(
                      "relative flex min-h-[260px] w-full flex-col justify-between rounded-[24px] bg-[#D9D9D9] sm:rounded-[30px]",
                      "p-5 sm:p-6 2xl:aspect-[425/340] 2xl:px-[27px] 2xl:py-[29px]",
                      selected && "ring-2 ring-[#542452]"
                    )}
                  >
                    {/* Save badge: Figma 128 x 43, radius 20, #969696 */}
                    <span
                      className={cn(
                        "inline-flex w-fit items-center justify-center rounded-[16px] bg-[#969696] px-4 py-1.5 font-[Poppins] font-semibold capitalize leading-[100%] text-white",
                        "text-[13px] sm:text-[15px] 2xl:h-[43px] 2xl:min-w-[128px] 2xl:rounded-[20px] 2xl:px-5 2xl:py-2 2xl:text-[18px]"
                      )}
                    >
                      Save 60%
                    </span>

                    {/* Optional product image */}
                    <div className="relative my-3 min-h-[60px] flex-1">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          placeholder="blur"
                          sizes="(min-width: 1536px) 250px, (min-width: 640px) 25vw, 60vw"
                          className="object-contain"
                        />
                      )}
                    </div>

                    {/* Title + price (left), Add button (right) */}
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <h3
                          className={cn(
                            "font-[Poppins] font-normal capitalize leading-[1.2] tracking-[0%] text-black",
                            "text-[14px] sm:text-[16px] 2xl:text-[19px] 2xl:leading-[100%]"
                          )}
                        >
                          {item.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 2xl:mt-4">
                          <span
                            className={cn(
                              "font-[Poppins] font-semibold capitalize leading-[100%] text-black",
                              "text-[16px] sm:text-[18px] 2xl:text-[24px]"
                            )}
                          >
                            {formatItemPrice(item.price)}
                          </span>
                          <span
                            className={cn(
                              "font-[Poppins] font-normal capitalize leading-[100%] text-black line-through",
                              "text-[13px] sm:text-[14px] 2xl:text-[20px]"
                            )}
                          >
                            {formatItemPrice(item.oldPrice)}
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="addToCart"
                        size="none"
                        aria-pressed={selected}
                        onClick={() => toggleItem(item.id)}
                        className="!w-auto shrink-0 px-5 py-2.5 sm:px-6 2xl:h-[56px] 2xl:min-w-[128px] 2xl:text-[20px]"
                      >
                        {selected ? "Remove" : "Add"}
                      </Button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {/* Bundle panel: Figma 574 x 703, radius 30, padding 40 */}
          <aside
            aria-label="Your bundle"
            className={cn(
              "flex min-h-[420px] flex-col rounded-[24px] bg-[#D9D9D9] p-5 sm:rounded-[30px] sm:p-8 2xl:p-10"
            )}
          >
            <p
              className={cn(
                "font-[Poppins] font-semibold uppercase leading-[100%] tracking-[0%] text-[#542452]",
                "text-[14px] sm:text-[16px] 2xl:text-[18px]"
              )}
            >
              Buy Together
            </p>
            <h3
              className={cn(
                "mt-2 font-[Poppins] font-semibold capitalize leading-[100%] tracking-[0%] text-black sm:mt-3",
                "text-[28px] sm:text-[34px] 2xl:text-[45px]"
              )}
            >
              Your Bundle
            </h3>
            <p
              className={cn(
                "mt-3 font-[Poppins] font-normal leading-[100%] tracking-[0.03em] text-[#676767]",
                "text-[14px] sm:text-[16px] 2xl:text-[18px]"
              )}
            >
              {unlocked
                ? "30% bundle discount applied."
                : "Add at least 3 products to proceed and Save 30%"}
            </p>

            {/* Selected items */}
            <ul className="my-5 flex-1 space-y-3 overflow-y-auto">
              {selectedItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-[16px] bg-white/60 px-4 py-3"
                >
                  <span className="min-w-0 font-[Poppins] text-[14px] leading-[1.3] text-black sm:text-[16px]">
                    {item.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-[Poppins] text-[14px] font-semibold text-black sm:text-[16px]">
                      {formatItemPrice(item.price)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => toggleItem(item.id)}
                      className="rounded-full p-1 text-[#542452] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#542452]"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>

            {/* Total + button */}
            <div className="border-t border-[#676767]/60 pt-4 2xl:pt-5">
              <div className="flex items-center justify-between gap-4">
                <span
                  className={cn(
                    "font-[Poppins] font-semibold capitalize leading-[100%] text-black",
                    "text-[18px] sm:text-[22px] 2xl:text-[26px]"
                  )}
                >
                  Total
                </span>
                <span
                  className={cn(
                    "font-[Poppins] font-semibold leading-[100%] text-black",
                    "text-[18px] sm:text-[22px] 2xl:text-[26px]"
                  )}
                >
                  {formatTotal(total)}
                </span>
              </div>

              <Button
                type="button"
                variant="addToCart"
                size="none"
                disabled={!unlocked}
                onClick={handleAddBundle}
                className="mt-4 disabled:cursor-not-allowed disabled:opacity-50 2xl:mt-5 2xl:h-[60px]"
              >
                Add Bundle To Cart
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default BuildBundle;