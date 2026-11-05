"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { cn } from "@/src/lib/utils";

export default function ProductGallery({ images, alt }: { images: StaticImageData[]; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image: 722 x 477, radius 20, border #AAAAAA */}
      <div className="relative aspect-[722/477] w-full overflow-hidden rounded-[20px] border border-[#AAAAAA] bg-white">
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1536px) 722px, (min-width: 1024px) 50vw, 100vw"
          className="object-contain p-4"
        />
      </div>

      {/* Thumbnails: 230 x 152 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {images.slice(0, 3).map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}`}
            aria-pressed={i === active}
            className={cn(
              "relative aspect-[230/152] overflow-hidden rounded-[20px] border bg-white transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#542452]",
              i === active ? "border-2 border-[#542452]" : "border-[#AAAAAA]"
            )}
          >
            <Image src={img} alt="" fill sizes="230px" className="object-contain p-2" />
          </button>
        ))}
      </div>
    </div>
  );
}