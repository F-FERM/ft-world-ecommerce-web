"use client";

import { Button } from "@/src/components/ui/button";
import api from "@/src/lib/axios";
import { cn } from "@/src/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import HeroSlide1 from "../../../../public/images/HeroSlide1.png";
import OfferShadow from "../../../../public/images/offerpriceshadow.png";

/* -------------------------------------------------------------------------- */
/*                                TYPES + DATA                                */
/* -------------------------------------------------------------------------- */

interface BannerDto {
  _id: string;
  isDeleted: boolean;
  isActive: boolean;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  offerText: string;
}

interface Slide {
  id: string;
  src: string | StaticImageData;
  title: string;
  description: string;
  offerText: string;
  buttonText: string;
  buttonUrl: string;
}

// Shown when the API fails or returns no active banners
const FALLBACK_SLIDE: Slide = {
  id: "fallback",
  src: HeroSlide1,
  title: "Bring every print to life.",
  description:
    "Toner, cartridges, ink bottles and essential printer accessories for home, office and business printing — without the hassle.",
  offerText: "₹399",
  buttonText: "Shop Now",
  buttonUrl: "/shop",
};

const toSlide = (b: BannerDto): Slide => ({
  id: b._id,
  src: b.imageUrl,
  title: b.title,
  description: b.description,
  offerText: b.offerText,
  buttonText: b.buttonText,
  buttonUrl: b.buttonUrl,
});

const fetchSlides = async (): Promise<Slide[]> => {
  const { data } = await api.get<{ data: BannerDto[] }>("/banner");
  return (data?.data ?? [])
    .filter((b) => b.isActive && !b.isDeleted && b.imageUrl)
    .map(toSlide);
};

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;
const DOT_OPACITY = [1, 0.85, 0.55, 0.2];

const HERO_SIZE =
  "min-h-[620px] sm:min-h-[680px] lg:min-h-[800px] lg:aspect-[1920/874]";

const isExternal = (url: string) => /^https?:\/\//i.test(url);

/* -------------------------------------------------------------------------- */
/*                                    SLIDE                                   */
/* -------------------------------------------------------------------------- */

function HeroSlideItem({
  slide,
  isActive,
  isFirst,
}: {
  slide: Slide;
  isActive: boolean;
  isFirst: boolean;
}) {
  const external = isExternal(slide.buttonUrl);

  return (
    <div
      aria-hidden={!isActive}
      inert={!isActive}
      className={cn(
        // all slides share one grid cell, so the hero height = tallest slide
        "relative isolate [grid-area:1/1]",
        "transition-opacity duration-700 motion-reduce:transition-none",
        isActive ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <Image
        src={slide.src}
        alt=""
        fill
        sizes="100vw"
        priority={isFirst}
        placeholder={typeof slide.src === "string" ? "empty" : "blur"}
        className="-z-20 object-cover object-[70%_center] sm:object-center"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(292.94deg,rgba(0,0,0,0)_39.55%,rgba(57,17,55,0.8)_100.39%)]"
      />

      <div
        className={cn(
          "relative z-10 flex w-full flex-col items-start",
          "px-4 pb-24 pt-[104px]",
          "sm:px-8 sm:pt-[130px]",
          "xl:px-6 xl:pt-[190px]",
          "2xl:px-20",
          HERO_SIZE
        )}
      >
        <h1
          className={cn(
            "max-w-[16ch] text-balance break-words font-semibold uppercase tracking-[0.03em] text-white",
            "text-[32px] leading-[1.4] sm:text-[48px] md:text-[56px] lg:text-[64px] 2xl:text-[80px]"
          )}
        >
          {slide.title}
        </h1>

        {slide.description && (
          <p
            className={cn(
              "mt-4 max-w-[960px] font-normal tracking-[0.03em] text-[#EDEDED] lg:mt-[30px]",
              "text-[14px] leading-[1.5] sm:text-[16px] 2xl:text-[18px]"
            )}
          >
            {slide.description}
          </p>
        )}

        {slide.offerText && (
          <div
            className={cn(
              "relative isolate mt-6 flex flex-col gap-[6px] lg:mt-9",
              "px-5 py-4 sm:px-8 sm:py-5 2xl:px-[38px] 2xl:py-[26px]"
            )}
          >
            <Image
              src={OfferShadow}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1536px) 320px, 260px"
              className="pointer-events-none -z-10 select-none object-fill"
            />
            <span
              className={cn(
                "relative font-normal capitalize leading-[100%] tracking-[0.07em] text-white",
                "text-[22px] sm:text-[28px] lg:text-[32px] 2xl:text-[38px]"
              )}
            >
              Offer Price@
            </span>
            <span
              className={cn(
                "relative max-w-[12ch] break-words font-semibold capitalize leading-[100%] tracking-[0.07em] text-white",
                "text-[24px] sm:text-[30px] lg:text-[36px] 2xl:text-[42px]"
              )}
            >
              {slide.offerText}
            </span>
          </div>
        )}

        {slide.buttonText && slide.buttonUrl && (
          <Button
            variant="shopNow"
            size="none"
            nativeButton={false}
            render={
              external ? (
                <a href={slide.buttonUrl} target="_blank" rel="noreferrer" />
              ) : (
                <Link href={slide.buttonUrl} />
              )
            }
            className="mt-6 lg:mt-7"
          >
            {slide.buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    HERO                                    */
/* -------------------------------------------------------------------------- */

interface HeroProps {
  className?: string;
}

const Hero = ({ className }: HeroProps) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["heroBanners"],
    queryFn: fetchSlides,
    staleTime: 5 * 60 * 1000,
  });

  const slides = useMemo(
    () => (data && data.length > 0 ? data : [FALLBACK_SLIDE]),
    [data]
  );
  const count = slides.length;
  const hasSlider = count > 1;
  const current = active % count; // stays valid if the slide count changes

  const go = (dir: 1 | -1) => setActive((current + dir + count) % count);

  // `current` is a dependency so clicking a dot / swiping restarts the timer.
  useEffect(() => {
    if (!hasSlider || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(
      () => setActive((current + 1) % count),
      AUTOPLAY_MS
    );
    return () => window.clearTimeout(id);
  }, [hasSlider, paused, current, count]);

  const wrapperClass = cn(
    "relative isolate w-full overflow-hidden bg-[#2a0f29]",
    className
  );

  if (isLoading) {
    return (
      <section
        aria-busy="true"
        aria-label="Loading banners"
        className={cn(wrapperClass, HERO_SIZE, "animate-pulse")}
      />
    );
  }

  return (
    <section
      data-slot="hero"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || !hasSlider) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
      }}
      className={cn(wrapperClass, "grid")}
    >
      {slides.map((slide, i) => (
        <HeroSlideItem
          key={slide.id}
          slide={slide}
          isActive={i === current}
          isFirst={i === 0}
        />
      ))}

      {/* Slider dots */}
      {hasSlider && (
        <div
          role="group"
          aria-label="Hero slides"
          className="absolute inset-x-0 bottom-6 z-20 flex flex-wrap items-center justify-center sm:bottom-10"
        >
          {slides.map((slide, i) => {
            const distance = Math.abs(i - current);
            const opacity =
              DOT_OPACITY[Math.min(distance, DOT_OPACITY.length - 1)];

            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
                onClick={() => setActive(i)}
                className="group p-[6px] focus-visible:outline-none"
              >
                <span
                  style={{ opacity }}
                  className={cn(
                    "block size-[10px] rounded-full bg-white transition-opacity duration-300",
                    "group-hover:!opacity-100",
                    "group-focus-visible:ring-2 group-focus-visible:ring-white"
                  )}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Hero;