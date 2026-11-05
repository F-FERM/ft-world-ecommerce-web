"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

export interface Product {
  id: string;
  title: string;
  compatibleFor: string;
  models: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: StaticImageData | string;
  imageAlt?: string;
  href?: string;
  category?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

const formatPrice = (value: number) => `AED. ${value.toFixed(2)}`;

const ProductCard = ({ product, onAddToCart, className }: ProductCardProps) => {
  const { id, title, compatibleFor, models, price, oldPrice, image, imageAlt } = product;

  // Every product opens its own detail page: /products/p1, /products/p2 ...
  const href = product.href ?? `/product/${id}`;

  const discount =
    product.discount ??
    (oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);

  return (
    <article
      data-slot="product-card"
      className={cn(
        "relative flex h-full w-full flex-col rounded-[24px] border border-[#6E2D6B] bg-white sm:rounded-[30px]",
        "px-4 py-5 sm:px-5 sm:py-6 2xl:px-[27px] 2xl:py-[29px]",
        className
      )}
    >
      {/* Discount badge */}
      {discount > 0 && (
        <span
          className={cn(
            "pointer-events-none absolute left-4 top-4 z-10 rounded-[16px] border border-[#FF78F9] bg-[#6E2D6B]/80 text-white sm:left-5 sm:top-5 2xl:left-[27px] 2xl:top-[29px] 2xl:rounded-[20px]",
            "px-3 py-1.5 text-[12px] font-medium leading-[100%] sm:px-4 sm:text-[14px] 2xl:px-5 2xl:py-2 2xl:text-[16px]"
          )}
        >
          Discount {discount}%
        </span>
      )}

      {/* Image */}
      <div className="relative aspect-[296/200] w-full">
        <Image
          src={image}
          alt={imageAlt ?? title}
          fill
          sizes="(min-width: 1536px) 296px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain"
        />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <h3
          className={cn(
            "font-semibold capitalize leading-[100%] tracking-[0%] text-black",
            "text-[18px] sm:text-[20px] 2xl:text-[22px]"
          )}
        >
          {/* The after: pseudo-element stretches this link over the whole card (article is `relative`),
              so clicking anywhere on the card navigates. */}
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {title}
          </Link>
        </h3>

        <p
          className={cn(
            "mt-1 font-normal uppercase leading-[100%] tracking-[0%] text-black",
            "text-[14px] sm:text-[16px] 2xl:text-[18px]"
          )}
        >
          {compatibleFor}
        </p>

        <p
          className={cn(
            "font-normal capitalize leading-[120%] tracking-[0%] text-[#525252]",
            "text-[13px] sm:text-[14px] 2xl:text-[16px]"
          )}
        >
          {models}
        </p>

        {/* Prices */}
        <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={cn(
              "font-semibold capitalize leading-[100%] tracking-[0%] text-black",
              "text-[18px] sm:text-[20px] 2xl:text-[24px]"
            )}
          >
            {formatPrice(price)}
          </span>
          {oldPrice && (
            <span
              className={cn(
                "font-normal capitalize leading-[100%] tracking-[0%] text-[#464646] line-through",
                "text-[14px] sm:text-[16px] 2xl:text-[20px]"
              )}
            >
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>

        {/* relative z-10 keeps the button above the stretched link, so "Add to cart" does NOT navigate */}
        <Button
          type="button"
          variant="addToCart"
          size="none"
          onClick={() => onAddToCart?.(product)}
          className="relative z-10 mt-auto"
        >
          Add to cart
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;