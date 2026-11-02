"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import { cn } from "@/src/lib/utils";
import PillButton from "./ShowFilters";

export interface SortOption {
  value: string;
  label: string;
}

interface ProductToolbarProps {
  onShowFilters?: () => void;
  filtersOpen?: boolean;
  filtersLabel?: string;

  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  sortLabel?: string;

  className?: string;
}

const ProductToolbar = ({
  onShowFilters,
  filtersOpen,
  filtersLabel = "Show Filters",
  sortOptions,
  sortValue,
  onSortChange,
  sortLabel = "Sort By :",
  className,
}: ProductToolbarProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = sortOptions.find((o) => o.value === sortValue) ?? sortOptions[0];

  // Close the sort menu on outside click or Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <section
      data-slot="product-toolbar"
      className={cn(
        "w-full px-4 pt-10 pb-5 sm:px-8 sm:pt-14 xl:px-12 2xl:px-[227px] 2xl:pt-[136px] 2xl:pb-[27px]",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-[1464px] items-center justify-between gap-3 sm:gap-4">
        {/* Show Filters */}
        <PillButton
          onClick={onShowFilters}
          aria-expanded={filtersOpen}
          icon={<SlidersHorizontal className="size-4 shrink-0 sm:size-5 2xl:size-6" aria-hidden="true" />}
        >
          {filtersLabel}
        </PillButton>

        {/* Sort By */}
        <div className="flex items-center gap-2 sm:gap-4 2xl:gap-[30px]">
          <span className="hidden text-[16px] font-normal capitalize leading-[100%] text-black sm:inline 2xl:text-[18px]">
            {sortLabel}
          </span>

          <div ref={wrapperRef} className="relative">
            <PillButton
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listId}
              aria-label={`${sortLabel} ${selected?.label ?? ""}`}
              onClick={() => setOpen((v) => !v)}
              icon={
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full border-2 border-black sm:size-2.5"
                />
              }
            >
              {selected?.label}
            </PillButton>

            {open && (
              <ul
                id={listId}
                role="listbox"
                aria-label="Sort products"
                className="absolute right-0 top-full z-20 mt-2 min-w-full overflow-hidden rounded-[24px] border-2 border-black bg-white py-2 shadow-lg"
              >
                {sortOptions.map((option) => {
                  const isSelected = option.value === sortValue;
                  return (
                    <li key={option.value} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => {
                          onSortChange(option.value);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-4 whitespace-nowrap px-5 py-2.5 text-left capitalize text-black",
                          "text-[14px] sm:text-[16px] 2xl:text-[18px]",
                          "hover:bg-black/5 focus-visible:bg-black/5 focus-visible:outline-none",
                          isSelected ? "font-semibold" : "font-normal"
                        )}
                      >
                        {option.label}
                        {isSelected && <Check className="size-4 shrink-0" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductToolbar;