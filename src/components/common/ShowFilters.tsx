import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface PillButtonProps extends ComponentProps<"button"> {
  icon?: ReactNode;
}

const PillButton = ({ icon, children, className, type = "button", ...props }: PillButtonProps) => {
  return (
    <button
      type={type}
      data-slot="pill-button"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[40px] border-2 border-black bg-white text-black",
        "font-semibold capitalize leading-[100%] tracking-[0%]",
        "h-11 px-4 text-[14px] sm:h-[52px] sm:px-6 sm:text-[18px] lg:min-w-[220px] xl:text-[20px]",
        "2xl:h-[60px] 2xl:w-[277px] 2xl:gap-[10px] 2xl:px-[31px] 2xl:py-[17px] 2xl:text-[22px]",
        "cursor-pointer transition-colors hover:bg-black/5",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#542452]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};

export default PillButton;