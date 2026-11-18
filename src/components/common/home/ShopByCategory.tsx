"use client";

import api from "@/src/lib/axios";
import { cn } from "@/src/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

/* -------------------------------------------------------------------------- */
/*                                TYPES + API                                 */
/* -------------------------------------------------------------------------- */

export interface AccessoryCategory {
  _id: string;
  name: string;
  imageUrl: string;
  slug: string;
}

export interface Category {
  _id: string;
  isDeleted: boolean;
  name: string;
  description: string;
  isActive: boolean;
  imageUrl: string;
  slug: string;
  accessoryCategories: (string | AccessoryCategory)[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<ApiResponse<Category[]>>("/categories");
  return data?.data ?? [];
};

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const SKELETON_COUNT = 4;

const GRID_CLASS =
  "mt-6 grid grid-cols-1 gap-[15px] sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-4 2xl:mt-[50px]";

// A category is a "parent" when no other category lists it in accessoryCategories.
// Inactive and deleted categories are excluded.
const getParentCategories = (categories: Category[]): Category[] => {
  const childIds = new Set<string>();
  for (const cat of categories) {
    for (const acc of cat.accessoryCategories ?? []) {
      childIds.add(typeof acc === "string" ? acc : acc._id);
    }
  }

  return categories.filter(
    (cat) => cat.isActive && !cat.isDeleted && !childIds.has(cat._id)
  );
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

interface ShopByCategoryProps {
  className?: string;
}

const ShopByCategory = ({ className }: ShopByCategoryProps) => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["shopByCategory"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const visibleCategories = useMemo(
    () => getParentCategories(categories ?? []),
    [categories]
  );

  // Nothing to show once loaded (empty or failed) -> hide the whole section
  if (!isLoading && visibleCategories.length === 0) return null;

  return (
    <section
      data-slot="shop-by-category"
      className={cn(
        "w-full bg-white px-4 pb-12 pt-10 sm:px-8 sm:pb-16 xl:px-12 2xl:px-0",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1565px]">
        <p
          className={cn(
            "font-semibold capitalize leading-[100%] tracking-[0%] text-primary",
            "text-[14px] sm:text-[16px] 2xl:text-[18px]"
          )}
        >
          Shop By Category
        </p>

        <h2
          className={cn(
            "font-semibold capitalize leading-[100%] tracking-[0%] text-black sm:mt-4 2xl:mt-[10px]",
            "text-[28px] sm:text-[36px] md:text-[42px] xl:text-[48px] 2xl:text-[55px]"
          )}
        >
          What Are You Looking For?
        </h2>

        {isLoading ? (
          <ul className={GRID_CLASS} aria-busy="true">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <li
                key={i}
                className="aspect-[355/209] w-full animate-pulse rounded-[30px] bg-gray-200"
              />
            ))}
          </ul>
        ) : (
          <ul className={GRID_CLASS}>
            {visibleCategories.map((category) => (
              <li key={category._id}>
                <Link
                  href={`/shop/${category.slug}`}
                  className={cn(
                    "group relative isolate flex aspect-[355/209] w-full flex-col justify-between overflow-hidden",
                    "rounded-[30px] bg-[#9B4A97] p-5 sm:p-[30px]",
                    "shadow-[0_0_4px_0_#00000040]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}
                >
                  {category.imageUrl && (
                    <>
                      <Image
                        src={category.imageUrl}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="(min-width: 1536px) 355px, (min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_100%)]"
                      />
                    </>
                  )}

                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-9 items-center justify-center self-end rounded-full bg-[#6E2D6B] p-[10px] text-white sm:size-[42px]",
                      "transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    )}
                  >
                    <ArrowUpRight className="size-full" strokeWidth={1.75} />
                  </span>

                  <span
                    className={cn(
                      "line-clamp-2 pr-2 font-semibold capitalize leading-[100%] tracking-[0%] text-white",
                      "text-[20px] sm:text-[22px] 2xl:text-[26px]"
                    )}
                  >
                    {category.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ShopByCategory;