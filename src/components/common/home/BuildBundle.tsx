"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { addBundleToCart } from "@/src/api/useCart";
import { BundleItem } from "@/src/api/products";

const MIN_ITEMS = 1;
const BUNDLE_DISCOUNT = 0.3;

const formatItemPrice = (value: number) => `Rs. ${value}`;
const formatTotal = (value: number) => `Rs.${value.toFixed(2)} INR`;

const calcSavePercent = (price: number, oldPrice: number) =>
  oldPrice > price && oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

const productsLabel = (count: number) => (count === 1 ? "product" : "products");

type Status = { type: "success" | "error"; message: string } | null;

interface BuildBundleProps {
  className?: string;
  items: BundleItem[];
}

const BuildBundle = ({ className, items }: BuildBundleProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const unlocked = selectedItems.length >= MIN_ITEMS;
  const total = unlocked ? subtotal * (1 - BUNDLE_DISCOUNT) : subtotal;

  if (items.length === 0) return null;

  const toggleItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item?.inStock) return;

    setStatus(null);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAddBundle = async () => {
    if (!unlocked || isSubmitting) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      await addBundleToCart({
        items: selectedItems.map((item) => ({ productId: item.productId, quantity: 1 })),
      });

      setStatus({ type: "success", message: "Bundle added to your cart." });
      setSelectedIds([]);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      data-slot="build-bundle"
      className={cn("w-full bg-white px-4 py-10 sm:px-8 sm:py-14 xl:px-12 2xl:px-0", className)}
    >
      <div className="mx-auto w-full max-w-[1464px]">
        {/* Heading */}
        <p
          className={cn(
            "font-[Poppins] font-semibold uppercase leading-[100%] tracking-[0%] text-[#542452]",
            "text-[13px] sm:text-[16px] 2xl:text-[18px]"
          )}
        >
          Buy Together
        </p>
        <h2
          className={cn(
            "mt-2 font-[Poppins] font-semibold capitalize leading-[1.1] tracking-[0%] text-black sm:mt-3",
            "text-[26px] sm:text-[36px] md:text-[42px] xl:text-[48px] 2xl:text-[55px]"
          )}
        >
          Build Your Own Bundle
        </h2>
        <p
          className={cn(
            "mt-3 max-w-[640px] font-[Poppins] font-normal leading-[1.4] tracking-[0.03em] text-[#676767] sm:mt-4",
            "text-[14px] sm:text-[16px] 2xl:max-w-none 2xl:text-[18px]"
          )}
        >
          Choose at least {MIN_ITEMS} {productsLabel(MIN_ITEMS)} and add {MIN_ITEMS === 1 ? "it" : "them together"} to
          your cart.
        </p>

        {/* Layout: product cards (left) + bundle panel (right) */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 xl:grid-cols-[850fr_574fr] xl:items-stretch 2xl:mt-[50px]">
          {/* Product cards: 1 col mobile -> 2 cols from sm */}
          <ul className="grid grid-cols-1 content-start gap-4 sm:grid-cols-2 sm:gap-5 2xl:gap-x-5 2xl:gap-y-[23px]">
            {items.map((item) => {
              const selected = selectedIds.includes(item.id);
              const savePercent = calcSavePercent(item.price, item.oldPrice);

              return (
                <li key={item.id} className="flex min-w-0">
                  <article
                    className={cn(
                      "relative flex min-h-[260px] w-full flex-col justify-between rounded-[20px] bg-[#D9D9D9] transition-shadow sm:min-h-[280px] sm:rounded-[30px]",
                      "p-4 sm:p-6 2xl:aspect-[425/340] 2xl:px-[27px] 2xl:py-[29px]",
                      selected && "ring-2 ring-[#542452]",
                      !item.inStock && "opacity-70"
                    )}
                  >
                    {/* Save badge */}
                    {savePercent > 0 && (
                      <span
                        className={cn(
                          "inline-flex w-fit items-center justify-center rounded-[14px] bg-[#969696] px-3 py-1.5 font-[Poppins] font-semibold capitalize leading-[100%] text-white",
                          "text-[12px] sm:rounded-[16px] sm:px-4 sm:text-[15px]",
                          "2xl:h-[43px] 2xl:min-w-[128px] 2xl:rounded-[20px] 2xl:px-5 2xl:py-2 2xl:text-[18px]"
                        )}
                      >
                        Save {savePercent}%
                      </span>
                    )}

                    {/* Product image */}
                    <div className="relative my-3 min-h-[70px] flex-1 sm:min-h-[80px]">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          {...(typeof item.image !== "string" && { placeholder: "blur" as const })}
                          sizes="(min-width: 1536px) 250px, (min-width: 640px) 25vw, 60vw"
                          className="object-contain"
                        />
                      )}
                    </div>

                    {/* Title + price + Add button: stacks on very small screens */}
                    <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between">
                      <div className="min-w-0">
                        <h3
                          className={cn(
                            "font-[Poppins] font-normal capitalize leading-[1.25] tracking-[0%] text-black",
                            "text-[13px] sm:text-[16px] 2xl:text-[19px] 2xl:leading-[150%]"
                          )}
                        >
                          {item.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:mt-3 2xl:mt-4">
                          <span
                            className={cn(
                              "font-[Poppins] font-semibold capitalize leading-[100%] text-black",
                              "text-[16px] sm:text-[18px] 2xl:text-[24px]"
                            )}
                          >
                            {formatItemPrice(item.price)}
                          </span>
                          {item.oldPrice > item.price && (
                            <span
                              className={cn(
                                "font-[Poppins] font-normal capitalize leading-[100%] text-black line-through",
                                "text-[12px] sm:text-[14px] 2xl:text-[20px]"
                              )}
                            >
                              {formatItemPrice(item.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="addToCart"
                        size="none"
                        aria-pressed={selected}
                        disabled={!item.inStock}
                        onClick={() => toggleItem(item.id)}
                        className="!w-full shrink-0 px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-60 min-[420px]:!w-auto sm:px-6 2xl:h-[56px] 2xl:min-w-[128px] 2xl:text-[20px]"
                      >
                        {!item.inStock ? "Out of stock" : selected ? "Remove" : "Add"}
                      </Button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {/* Wrapper stretches to the height of the card grid on desktop */}
          <div className="relative min-h-[380px] sm:min-h-[420px] xl:min-h-[420px]">
            <aside
              aria-label="Your bundle"
              className={cn(
                "flex h-full flex-col rounded-[20px] bg-[#D9D9D9] p-4 sm:rounded-[30px] sm:p-8 2xl:p-10",
                // desktop: fill the wrapper exactly, never push the row taller
                "xl:absolute xl:inset-0"
              )}
            >
              <p
                className={cn(
                  "font-[Poppins] font-semibold uppercase leading-[100%] tracking-[0%] text-[#542452]",
                  "text-[13px] sm:text-[16px] 2xl:text-[18px]"
                )}
              >
                Buy Together
              </p>
              <h3
                className={cn(
                  "mt-2 font-[Poppins] font-semibold capitalize leading-[1.1] tracking-[0%] text-black sm:mt-3",
                  "text-[26px] sm:text-[34px] 2xl:text-[45px]"
                )}
              >
                Your Bundle
              </h3>
              <p
                className={cn(
                  "mt-3 font-[Poppins] font-normal leading-[1.4] tracking-[0.03em] text-[#676767]",
                  "text-[13px] sm:text-[16px] 2xl:text-[18px]"
                )}
              >
                {unlocked
                  ? "30% bundle discount applied."
                  : `Add at least ${MIN_ITEMS} ${productsLabel(MIN_ITEMS)} to proceed and Save 30%`}
              </p>

              {/* Selected items: scrolls inside the panel */}
              <ul className="my-5 max-h-[320px] min-h-[60px] flex-1 space-y-3 overflow-y-auto pr-1 xl:max-h-none xl:min-h-0">
                {selectedItems.length === 0 && (
                  <li className="py-4 text-center font-[Poppins] text-[13px] text-[#676767] sm:text-[15px]">
                    No products selected yet.
                  </li>
                )}
                {selectedItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-[14px] bg-white/60 px-3 py-3 sm:rounded-[16px] sm:px-4"
                  >
                    <span className="min-w-0 font-[Poppins] text-[13px] leading-[1.3] text-black sm:text-[16px]">
                      {item.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 sm:gap-3">
                      <span className="font-[Poppins] text-[13px] font-semibold text-black sm:text-[16px]">
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

              {/* Total + button pinned to the bottom, as in the design */}
              <div className="shrink-0 border-t border-[#676767]/60 pt-4 2xl:pt-5">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <span
                    className={cn(
                      "font-[Poppins] font-semibold capitalize leading-[100%] text-black",
                      "text-[17px] sm:text-[22px] 2xl:text-[26px]"
                    )}
                  >
                    Total
                  </span>
                  <span
                    className={cn(
                      "font-[Poppins] font-semibold leading-[100%] text-black",
                      "text-[17px] sm:text-[22px] 2xl:text-[26px]"
                    )}
                  >
                    {formatTotal(total)}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="addToCart"
                  size="none"
                  disabled={!unlocked || isSubmitting}
                  aria-busy={isSubmitting}
                  onClick={handleAddBundle}
                  className="mt-4 disabled:cursor-not-allowed disabled:opacity-50 2xl:mt-5 2xl:h-[60px]"
                >
                  {isSubmitting ? "Adding..." : "Add Bundle To Cart"}
                </Button>

                {status && (
                  <p
                    role={status.type === "error" ? "alert" : "status"}
                    className={cn(
                      "mt-3 text-center font-[Poppins] text-[13px] sm:text-[15px]",
                      status.type === "success" ? "text-green-700" : "text-red-600"
                    )}
                  >
                    {status.message}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuildBundle;