import Image, { type StaticImageData } from "next/image";
import { cn } from "@/src/lib/utils";

import TonerBannerImage from "../../../../public/products/tonercartridgefullimage.png";

const DEFAULT_TITLE = "Toner Cartridge";

export const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const slugToTitle = (slug: string): string =>
  safeDecode(slug)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/**
 * Banner sizing:
 * - min-h is fluid: ~240px on phones, grows with viewport, caps at 522px.
 * - pt reserves room for the header that overlays the banner
 *   (uses --header-h from global CSS, falls back to 80px).
 * - pb gives the title breathing room at the bottom.
 */
const bannerHeight = [
  "min-h-[clamp(240px,55vw,522px)]",
  "pt-[var(--header-h,80px)]",
  "pb-6 sm:pb-8 lg:pb-12",
].join(" ");

interface CategoryBannerProps {
  parentCategory?: string;
  category?: string;
  title?: string;
  image?: StaticImageData | string;
  imageAlt?: string;
  className?: string;
}

const CategoryBanner = ({
  parentCategory,
  category,
  title,
  image = TonerBannerImage,
  imageAlt,
  className,
}: CategoryBannerProps) => {
  const heading = title ?? (category ? slugToTitle(category) : DEFAULT_TITLE);
  const alt =
    imageAlt ??
    `${parentCategory ? `${slugToTitle(parentCategory)} - ` : ""}${heading} banner`;
  const imageSrc = image || TonerBannerImage;

  return (
    <section
      data-slot="category-banner"
      className={cn(
        "relative isolate flex w-full items-center justify-center overflow-hidden bg-[#2a2a2a]",
        bannerHeight,
        className
      )}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority
        {...(typeof imageSrc !== "string" && { placeholder: "blur" as const })}
        sizes="100vw"
        // Bottom-anchored on phones so the products stay visible
        className="-z-20 object-cover object-bottom md:object-center"
      />

      {/* Dark overlay so the white title stays readable */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/55" />

      <h1
        className={cn(
          "w-full max-w-[1464px] px-4 text-center font-semibold uppercase text-white",
          "sm:px-8 xl:px-12",
          // Fluid font: 24px min → 6vw → 90px max
          "text-[clamp(1.5rem,6vw,5.625rem)] leading-[1.15] tracking-[0.03em]",
          "text-balance break-words"
        )}
      >
        {heading}
      </h1>
    </section>
  );
};

export const CategoryBannerSkeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn("w-full animate-pulse bg-[#2a2a2a]", bannerHeight, className)}
  />
);

export default CategoryBanner;