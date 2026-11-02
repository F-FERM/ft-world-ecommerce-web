"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import HeroSlide1 from "../../../../public/images/HeroSlide1.png";
import OfferShadow from "../../../../public/images/offerpriceshadow.png";
import { useEffect, useState } from "react";


const SLIDES = [
  { id: "slide-1", src: HeroSlide1, alt: "OG toner cartridges on an office desk" },
  { id: "slide-2", src: HeroSlide1, alt: "OG toner cartridges on an office desk" },
  { id: "slide-3", src: HeroSlide1, alt: "OG toner cartridges on an office desk" }, 
  { id: "slide-4", src: HeroSlide1, alt: "OG toner cartridges on an office desk" }, 
];

const SHOP_HREF = "/shop";
const AUTOPLAY_MS = 5000;
const DOT_OPACITY = [1, 0.85, 0.55, 0.2];

interface HeroProps {
  className?: string;
}

const Hero = ({ className }: HeroProps) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasSlider = SLIDES.length > 1;


  // `active` is a dependency so clicking a dot restarts the timer.
 useEffect(() => {
    if (!hasSlider || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(
      () => setActive((i) => (i + 1) % SLIDES.length),
      AUTOPLAY_MS
    );
    return () => window.clearTimeout(id);
  }, [hasSlider, paused, active]);

  return (
    <section
      data-slot="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "relative isolate w-full overflow-hidden",
        "min-h-[620px] sm:min-h-[680px] lg:min-h-[800px] lg:aspect-[1920/874]",
        className
      )}
    >
      {/* Background image(s) */}
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.id}
          src={slide.src}
          alt={slide.alt}
          fill
          sizes="100vw"
          priority={i === 0}
          placeholder="blur"
          aria-hidden={i !== active}
          className={cn(
            "-z-20 object-cover object-[70%_center] transition-opacity duration-700 motion-reduce:transition-none",
            "sm:object-center",
            i === active ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      <div
        aria-hidden="true"
        className={cn("absolute inset-0 -z-10 bg-[linear-gradient(292.94deg,rgba(0,0,0,0)_39.55%,rgba(57,17,55,0.8)_100.39%)]")}
      />

     

      <div
        className={cn(
          "relative z-10 flex w-full flex-col items-start",
          "px-4 pb-24 pt-[104px]",
          "sm:px-8 sm:pt-[130px]",
          "xl:px-6 xl:pt-[190px]",
          "2xl:px-20"
        )}
      >
        <h1
          className={cn(
            "font-semibold uppercase tracking-[0.03em] text-white",
            "text-[32px] leading-[1.4] sm:text-[48px] md:text-[56px] lg:text-[64px] 2xl:text-[80px]"
          )}
        >
          <span className="block">Bring every print</span>
          <span className="block">to life.</span>
        </h1>

        <p
          className={cn(
            "mt-4 max-w-[960px] font-normal tracking-[0.03em] text-[#EDEDED] lg:mt-[30px]",
            "text-[14px] leading-[1.5] sm:text-[16px] 2xl:text-[18px]"
          )}
        >
          Toner, cartridges, ink bottles and essential printer accessories for home, office and
          business printing — without the hassle.
        </p>

        {/* Offer: shadow image sits behind the text */}
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
              "relative font-normal capitalize tracking-[0.07em] text-white",
              "text-[22px] sm:text-[28px] lg:text-[32px] 2xl:text-[38px] leading-[100%]"
            )}
          >
            Offer Price@
          </span>
          <span
            className={cn(
              "relative font-semibold capitalize tracking-[0.07em] text-white",
              "text-[24px] sm:text-[30px] lg:text-[36px] 2xl:text-[42px] leading-[100%]"
            )}
          >
            ₹399
          </span>
        </div>

        <Button
          variant="shopNow"
          size="none"
          nativeButton={false}
          render={<Link href={SHOP_HREF} />}
          className="mt-6 lg:mt-7"
        >
          Shop Now
        </Button>
      </div>

      {/* Slider dots */}
      {hasSlider && (
        <div
          role="group"
          aria-label="Hero slides"
          className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center sm:bottom-10"
        >
          {SLIDES.map((slide, i) => {
            const distance = Math.abs(i - active);
            const opacity = DOT_OPACITY[Math.min(distance, DOT_OPACITY.length - 1)];

            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
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