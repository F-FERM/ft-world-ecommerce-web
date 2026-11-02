import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import BusinessImage from "../../../../public/images/leftbundle.png";

const BUNDLE_HREF = "/business/bundle";

const FEATURES = [
  "Bulk procurement",
  "Printer consumables",
  "Business solutions",
  "Product assistance",
];

interface BusinessSuppliesProps {
  className?: string;
}

const BusinessSupplies = ({ className }: BusinessSuppliesProps) => {
  return (
    <section
      data-slot="business-supplies"
      className={cn(
        "w-full bg-[#5424521A] px-4 py-10 sm:px-8 sm:py-14 xl:px-12 xl:py-16 2xl:px-[227px] 2xl:py-[89px]",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto grid w-full max-w-[1464px] grid-cols-1 items-center gap-8",
          "lg:grid-cols-2 lg:gap-8 xl:gap-5"
        )}
      >
        {/* Image: Figma 722 x 521, radius 30 */}
        <div className="relative aspect-[722/521] w-full overflow-hidden rounded-[24px] sm:rounded-[30px]">
          <Image
            src={BusinessImage}
            alt="FTWorld drum units, toner cartridges and printer consumables"
            fill
            placeholder="blur"
            sizes="(min-width: 1536px) 722px, (min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-col items-start lg:pl-2 xl:pl-0">
          <p
            className={cn(
              "font-semibold uppercase leading-[100%] tracking-[0%] text-primary",
              "text-[14px] sm:text-[16px] 2xl:text-[18px]"
            )}
          >
            FT World For Business
          </p>

          <h2
            className={cn(
              "mt-3 font-semibold capitalize tracking-[0%] text-black sm:mt-4 2xl:mt-[5px]",
              "text-[28px] leading-[1.35] sm:text-[36px] md:text-[42px] xl:text-[46px] 2xl:text-[55px] 2xl:leading-[1.5]"
            )}
          >
            <span className="block">Reliable Supplies.</span>
            <span className="block">Smarter Procurement.</span>
          </h2>

          <p
            className={cn(
              "mt-4 max-w-[720px] font-normal tracking-[0.03em] text-[#676767] sm:mt-5 2xl:mt-0",
              "text-[14px] leading-[1.6] sm:text-[16px] 2xl:text-[18px] 2xl:leading-[1.5]"
            )}
          >
            From a single office printer to a growing enterprise, discover consumables and
            components your team needs. Make repeat ordering easier with product discovery and
            custom bundles.
          </p>

        {/* Features: 2 columns. Right column starts at one shared x position */}
<ul
  className={cn(
    "mt-6 grid w-full grid-cols-1 gap-y-3 min-[420px]:grid-cols-[auto_auto] min-[420px]:justify-between min-[420px]:gap-x-8",
    "sm:mt-8 sm:gap-y-4 2xl:mt-11 2xl:gap-y-[18px]"
  )}
>
  {FEATURES.map((feature) => (
    <li
      key={feature}
      className={cn(
        "flex items-center gap-3 font-normal leading-[100%] tracking-[0.03em] text-[#676767] 2xl:gap-2",
        "text-[14px] sm:text-[15px] 2xl:text-[16px]"
      )}
    >
      <Check className="size-4 shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
      {feature}
    </li>
  ))}
</ul>

          <Button
            variant="addBundle"
            size="none"
            nativeButton={false}
            render={<Link href={BUNDLE_HREF} />}
            className="mt-6 sm:mt-8 2xl:mt-[27px] 2xl:h-[60px] 2xl:px-9"
          >
            Build A Supply Bundle
            <ArrowRight className="size-5 2xl:size-6" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BusinessSupplies;