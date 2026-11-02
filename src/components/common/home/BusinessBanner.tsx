import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

const BUSINESS_HREF = "/business";

interface BusinessBannerProps {
  className?: string;
}

const BusinessBanner = ({ className }: BusinessBannerProps) => {
  return (
    <section
      data-slot="business-banner"
      className={cn("w-full bg-white px-4 py-6 sm:px-8 sm:py-10 2xl:px-[81px]", className)}
    >
      {/* Figma: 1759 x 252, radius 30, padding 20 / 150, space-between */}
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1759px] flex-col items-start gap-6 rounded-[24px] bg-[#EEDDED] sm:rounded-[30px]",
          "px-5 py-6 sm:px-10 sm:py-8",
          "lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-16",
          "xl:px-24 2xl:min-h-[252px] 2xl:px-[150px] 2xl:py-5"
        )}
      >
        {/* Text */}
        <div className="flex max-w-[780px] flex-col items-start">
          <p
            className={cn(
              "font-[Poppins] font-semibold uppercase leading-[100%] tracking-[0%] text-[#542452]",
              "text-[14px] sm:text-[16px] 2xl:text-[18px]"
            )}
          >
            For Offices &amp; Businesses
          </p>

          <h2
            className={cn(
              "mt-2 font-[Poppins] font-semibold capitalize tracking-[0%] text-black",
              "text-[28px] leading-[36px] sm:text-[36px] sm:leading-[46px]",
              "xl:text-[44px] xl:leading-[56px] 2xl:text-[55px] 2xl:leading-[70px]"
            )}
          >
            Printing supplies for every workspace.
          </h2>

          <p
            className={cn(
              "mt-2 font-[Poppins] font-normal leading-[100%] tracking-[0.03em] text-[#676767]",
              "text-[14px] sm:text-[16px] 2xl:text-[18px]"
            )}
          >
            Everyday essentials, easy discovery and flexible procurement.
          </p>
        </div>

        <Button
          variant="explore"
          size="none"
          nativeButton={false}
          render={<Link href={BUSINESS_HREF} />}
          className="shrink-0"
        >
          Explore Business Solutions
          <ArrowRight className="size-5 2xl:size-6" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
};

export default BusinessBanner;