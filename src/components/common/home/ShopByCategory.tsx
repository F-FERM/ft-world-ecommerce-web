import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import TonerCartridge from "../../../../public/images/Tonercartridge.png";
import TonerBottle from "../../../../public/images/HeroSlide1.png";
import MulticolorToner from "../../../../public/images/multicolortoner.png";
import InkCartridge from "../../../../public/images/HeroSlide1.png";
import InkBottle from "../../../../public/images/HeroSlide1.png";
import PrintHead from "../../../../public/images/HeroSlide1.png";
import MaintenanceKit from "../../../../public/images/maintenancekit.png";
import DrumUnit from "../../../../public/images/drumunit.png";

interface Category {
  id: string;
  title: string;
  href: string;
  image?: StaticImageData; 
}

const CATEGORIES: Category[] = [
  { id: "toner-cartridge", title: "Toner Cartridge", href: "/shop/toner-cartridge", image: TonerCartridge },
  { id: "toner-bottle", title: "Toner Bottle", href: "/shop/toner-bottle", image: TonerBottle },
  { id: "multicolor-toner", title: "Multicolor Toner", href: "/shop/multicolor-toner", image: MulticolorToner },
  { id: "ink-cartridge", title: "Ink Cartridge", href: "/shop/ink-cartridge", image: InkCartridge },
  { id: "ink-bottle", title: "Ink Bottle", href: "/shop/ink-bottle", image: InkBottle },
  { id: "print-head", title: "Print Head", href: "/shop/print-head", image: PrintHead },
  { id: "maintenance-kit", title: "Maintenance Kit", href: "/shop/maintenance-kit", image: MaintenanceKit },
  { id: "drum-unit", title: "Drum Unit", href: "/shop/drum-unit", image: DrumUnit },
];

interface ShopByCategoryProps {
  className?: string;
}

const ShopByCategory = ({ className }: ShopByCategoryProps) => {
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
            " font-semibold capitalize leading-[100%] tracking-[0%] text-primary",
            "text-[14px] sm:text-[16px] 2xl:text-[18px]"
          )}
        >
          Shop By Category
        </p>

        <h2
          className={cn(
            " font-semibold capitalize leading-[100%] tracking-[0%] text-black sm:mt-4 2xl:mt-[10px]",
            "text-[28px] sm:text-[36px] md:text-[42px] xl:text-[48px] 2xl:text-[55px]"
          )}
        >
          What Are You Looking For?
        </h2>

        {/* Cards: 1 col → 2 → 4 (Figma: 4 x 2, 15px gap) */}
        <ul className="mt-6 grid grid-cols-1 gap-[15px] sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-4 2xl:mt-[50px]">
          {CATEGORIES.map((category) => {
            const hasImage = Boolean(category.image);

            return (
              <li key={category.id}>
                <Link
                  href={category.href}
                  className={cn(
                    "group relative isolate flex aspect-[355/209] w-full flex-col justify-between overflow-hidden",
                    "rounded-[30px] p-5 sm:p-[30px]",
                    "shadow-[0_0_4px_0_#00000040]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    hasImage ? "bg-[#E5BFE3]" : "bg-[#D9D9D9]"
                  )}
                >
                  {/* Imported image + dark gradient (Figma: transparent → 70% black) */}
                  {category.image && (
                    <>
                      <Image
                        src={category.image}
                        alt=""
                        aria-hidden="true"
                        fill
                        placeholder="blur"
                        sizes="(min-width: 1536px) 355px, (min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_100%)]"
                      />
                    </>
                  )}

                  {/* Arrow circle: 42 x 42, #6E2D6B */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-9 items-center justify-center self-end rounded-full p-[10px] text-white sm:size-[42px]",
                      "transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none",
                      hasImage ? "bg-[#6E2D6B]" : "bg-[#9B9B9B]"
                    )}
                  >
                    <ArrowUpRight className="size-full" strokeWidth={1.75} />
                  </span>

                  {/* Title */}
                  <span
                    className={cn(
                      "font-semibold capitalize leading-[100%] tracking-[0%]",
                      "text-[20px] sm:text-[22px] 2xl:text-[26px]",
                      hasImage ? "text-white" : "text-[#1F1F1F]"
                    )}
                  >
                    {category.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default ShopByCategory;