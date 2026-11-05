import Image from "next/image";
import icon1 from "../../../../public/icons/d1.png";
import icon2 from "../../../../public/icons/d2.png";
import icon3 from "../../../../public/icons/d3.png";

const ITEMS = [
  { icon: icon1, text: "In Stock! Ships Within 1-2 Business Days." },
  { icon: icon2, text: "90-Day Customer Support" },
  { icon: icon3, text: "1-Year Brand Warranty" },
  { icon: icon3, text: "Complimentary Shipping & Returns" },
];

export default function ServiceHighlights() {
  return (
    <ul className="flex flex-col gap-5 rounded-[10px] border border-[#B74FB3] bg-[#FFFAFF] px-5 py-6 sm:gap-[29px] sm:px-[30px] sm:py-[24px]">
      {ITEMS.map((item) => (
        <li key={item.text} className="flex items-center gap-4 sm:gap-5">
          {/* icon tile: 40 x 40, radius 10, light purple */}
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] ">
            <Image src={item.icon} alt="" width={24} height={24} className="size-10 object-contain" />
          </span>

          <span className="text-[16px] font-normal leading-[100%] text-black sm:text-[18px] 2xl:text-[22px]">
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}