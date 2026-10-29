import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
          shopNow: [
  "font-poppins font-semibold capitalize text-white",
  "bg-[#6E2D6B] rounded-[12px] sm:rounded-[16px] lg:rounded-[20px]",
  "w-full max-w-[227px] h-[44px] sm:h-[52px] lg:h-[60px]",
  "px-6 sm:px-10 lg:px-[52px] pt-[9px] pb-[10px] lg:pt-[13px] lg:pb-[14px]",
  "gap-[10px]",
  "text-[16px] sm:text-[19px] lg:text-[22px] leading-[100%] tracking-[0.07em]",
  "hover:bg-[#A823A2] focus-visible:ring-2 focus-visible:ring-[#F24DEB]/40",
  "[&_svg:not([class*='size-'])]:size-[15px]",
],
explore: [
  "font-poppins font-semibold uppercase text-white",
  "bg-[#542452] rounded-[10px]",
  "w-full max-w-[471px] h-[44px] sm:h-[52px] lg:h-[60px]",
  "px-4 sm:px-12 lg:px-[126px] py-[10px]",
  "gap-[10px]",
  "text-[14px] sm:text-[18px] lg:text-[24px] leading-[100%] tracking-[0%]",
  "hover:bg-[#6E2D6B] focus-visible:ring-2 focus-visible:ring-[#F24DEB]/40",
  "[&_svg:not([class*='size-'])]:size-[15px]",
],
addToCart: [
  "font-poppins font-semibold uppercase text-white",
  "bg-[#542452] rounded-[10px]",
  "w-full max-w-[294px] h-[44px] sm:h-[52px] lg:h-[60px]",
  "px-4 py-[10px] justify-center whitespace-nowrap",
  "gap-[10px]",
  "text-[14px] sm:text-[18px] lg:text-[24px] leading-[100%] tracking-[0%]",
  "hover:bg-[#6E2D6B] focus-visible:ring-2 focus-visible:ring-[#F24DEB]/40",
  "[&_svg:not([class*='size-'])]:size-[15px]",
],
add: [
  "font-poppins font-semibold uppercase text-white",
  "bg-[#542452] rounded-[10px]",
  "w-[96px] sm:w-[112px] lg:w-[128px] h-[44px] sm:h-[52px] lg:h-[60px]",
  "px-4 py-[10px] justify-center whitespace-nowrap",
  "gap-[10px]",
  "text-[14px] sm:text-[18px] lg:text-[24px] leading-[100%] tracking-[0%]",
  "hover:bg-[#6E2D6B] focus-visible:ring-2 focus-visible:ring-[#F24DEB]/40",
  "[&_svg:not([class*='size-'])]:size-[15px]",
],
addBundle: [
  "font-poppins font-semibold uppercase text-white",
  "bg-[#542452] rounded-[10px]",
  "w-full max-w-[494px] h-[44px] sm:h-[52px] lg:h-[60px]",
  "px-4 py-[10px] justify-center whitespace-nowrap",
  "gap-[10px]",
  "text-[14px] sm:text-[18px] lg:text-[24px] leading-[100%] tracking-[0%]",
  "hover:bg-[#6E2D6B] focus-visible:ring-2 focus-visible:ring-[#F24DEB]/40",
  "[&_svg:not([class*='size-'])]:size-[15px]",
],
subscribe: [
  "font-poppins font-semibold uppercase text-white",
  "bg-[#542452] rounded-[10px]",
  "w-[140px] sm:w-[170px] lg:w-[210px] h-[44px] sm:h-[52px] lg:h-[60px]",
  "px-4 lg:px-[23px] py-[10px] justify-center whitespace-nowrap",
  "gap-[10px]",
  "text-[14px] sm:text-[18px] lg:text-[24px] leading-[100%] tracking-[0%]",
  "hover:bg-[#6E2D6B] focus-visible:ring-2 focus-visible:ring-[#F24DEB]/40",
  "[&_svg:not([class*='size-'])]:size-[15px]",
],
      },
      
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
