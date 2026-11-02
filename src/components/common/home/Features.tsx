import Image, { type StaticImageData } from "next/image";
import { cn } from "@/src/lib/utils";
import CustomerServiceIcon from "../../../../public/icons/Feature1.png";
import FastShippingIcon from "../../../../public/icons/Feature2.png";
import BulkBuyingIcon from "../../../../public/icons/Feature3.png";
import SecurePaymentsIcon from "../../../../public/icons/Feature4.png";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: StaticImageData;
}

const FEATURES: Feature[] = [
  {
    id: "customer-service",
    title: "Customer service",
    description: "Dedicated assistance whenever you need it.",
    icon: CustomerServiceIcon,
  },
  {
    id: "fast-shipping",
    title: "Fast Shipping",
    description: "Dedicated assistance whenever you need it.",
    icon: FastShippingIcon,
  },
  {
    id: "bulk-buying",
    title: "Best Prices for Bulk Buying",
    description: "Competitive pricing for B2B and bulk orders.",
    icon: BulkBuyingIcon,
  },
  {
    id: "secure-payments",
    title: "Secure Payments",
    description: "Safe and secure payment processing for every order.",
    icon: SecurePaymentsIcon,
  },
];

interface FeaturesStripProps {
  className?: string;
}

const FeaturesStrip = ({ className }: FeaturesStripProps) => {
  return (
    <section
      data-slot="features-strip"
      className={cn("w-full bg-white px-4 py-8 sm:px-8 sm:py-10 xl:px-12 2xl:px-0", className)}
    >
      <div className="mx-auto w-full max-w-[1464px] border-t border-[#B0B0B0] pt-6 sm:pt-8 lg:pt-0">
        <ul
          className={cn(
            "grid grid-cols-1 gap-6",
            "sm:grid-cols-2 sm:gap-y-8",
            "lg:mt-[11px] lg:grid-cols-4 lg:items-stretch lg:gap-y-0",
            "2xl:grid-cols-[349fr_372fr_372fr_372fr]"
          )}
        >
          {FEATURES.map((feature, i) => (
            <li
              key={feature.id}
              className={cn(
                "flex items-center",
                "lg:h-40 lg:px-5 xl:px-6 2xl:h-[169px] 2xl:pl-12 2xl:pr-6",
                i === 0 && "2xl:pl-[25px]",
                i !== 0 && "lg:border-l lg:border-[#B0B0B0]"
              )}
            >
              <div className="flex items-start gap-4 2xl:gap-5">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-[10px] sm:size-12 2xl:size-[54px] 2xl:rounded-[12px]">
                  <Image
                    src={feature.icon}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="54px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 2xl:max-w-[215px]">
                  <h3
                    className={cn(
                      " font-extrabold leading-[1.4] tracking-[0px] text-[#101D35]",
                      "text-[17px] sm:text-[18px] 2xl:text-[21px] 2xl:leading-[29px]"
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 font-[DM_Sans] font-normal tracking-[0px] text-[#6A7486]",
                      "text-[14px] leading-[1.6] 2xl:mt-[10px] 2xl:text-[16px] 2xl:leading-[25.38px]"
                    )}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FeaturesStrip;