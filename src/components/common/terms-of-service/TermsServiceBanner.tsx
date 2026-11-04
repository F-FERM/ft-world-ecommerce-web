import Image, { type StaticImageData } from "next/image";
import { cn } from "@/src/lib/utils";

import refundPolicyBanner from "../../../../public/images/privacypolicy.jpg";




const bannerHeight =
  "h-[180px] sm:h-[240px] md:h-[300px] lg:h-[380px] xl:h-[440px] 2xl:h-[522px]";



const TermsOfServiceBanner = (
) => {


  return (
    <section
      data-slot="category-banner"
      className={cn(
        "relative isolate flex w-full items-center justify-center overflow-hidden bg-[#2a2a2a]",
        bannerHeight,
       
      )}
    >
      <Image
        src={refundPolicyBanner}
        alt={"terms of service"}
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />

      {/* Dark overlay so the white title stays readable */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/55" />

      <h1
        className={cn(
          "w-full max-w-[1464px] px-4 text-center font-semibold uppercase text-white sm:px-8 xl:px-12",
          "text-[28px] leading-[1.25] tracking-[0.03em]",
          "sm:text-[40px] md:text-[56px] lg:text-[68px] xl:text-[80px] 2xl:text-[90px] 2xl:leading-[112px]",
          "text-balance"
        )}
      >
       Terms Of Service
      </h1>
    </section>
  );
};

export const PrivacyPolicyBannerSkeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn("w-full animate-pulse bg-[#2a2a2a]", bannerHeight, className)}
  />
);

export default TermsOfServiceBanner;