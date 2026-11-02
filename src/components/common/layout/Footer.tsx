import Link from "next/link";
import Image from "next/image";
import { Send } from "lucide-react";
import { cn } from "@/src/lib/utils";
import LogoWatermark from "../../../../public/images/ftworldfooterlogo.png";
import Email from "../../../../public/icons/email.png";

const EXPLORE_LINKS = [
  { label: "Categories", href: "/categories" },
  { label: "Shop Products", href: "/products" },
  { label: "Build a Bundle", href: "/business/bundle" },
];

const QUICK_LINKS = [
  { label: "Search", href: "/search" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Contact Information", href: "/contact" },
];

const SUPPORT_EMAIL = "support@ftworld.com";

/* Brand icons are inline SVGs (lucide has dropped brand icons in newer versions). */
const SOCIALS = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <path d="M12 2a10 10 0 0 0-1.56 19.88v-7H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 12 2Z" />
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="12" cy="12.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="17" cy="7" r="0.9" />
      </>
    ),
  },
  {
    label: "WhatsApp",
    href: "#",
    icon: (
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.36A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.4 1.3-1.93 1.35-.5.05-1.12.07-1.8-.11-.42-.13-.95-.31-1.64-.6-2.89-1.25-4.78-4.15-4.92-4.34-.14-.2-1.17-1.56-1.17-2.98 0-1.42.74-2.12 1-2.4.26-.3.57-.37.76-.37h.55c.18 0 .42-.07.65.5.25.58.83 2.0.9 2.15.07.14.12.31.02.5-.1.2-.15.31-.29.48l-.44.5c-.14.14-.29.3-.12.58.16.29.73 1.2 1.56 1.94 1.07.95 1.98 1.25 2.26 1.39.28.14.45.12.61-.07.17-.2.7-.82.89-1.1.19-.28.38-.23.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.68-.18 1.37Z" />
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <path d="M22 5.9c-.7.3-1.5.5-2.4.7.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.7 11.7 0 0 1 3.4 4.7a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5 0 2 1.4 3.7 3.3 4.1-.6.2-1.2.2-1.9.1.5 1.6 2 2.8 3.8 2.9A8.2 8.2 0 0 1 2 18.5 11.6 11.6 0 0 0 8.3 20.3c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2Z" />
    ),
  },
];

/* Shared class strings */
const headingClass =
  "font-semibold leading-[100%] tracking-[0%] text-white text-[21px] sm:text-[24px] 2xl:text-[27px]";

const listClass = "mt-4 flex flex-col gap-3 2xl:mt-5 2xl:gap-[18px]";

const listItemClass = cn(
  "relative pl-[30px] font-normal leading-[100%] tracking-[0%] text-[#B2B2B2]",
  "text-[16px] sm:text-[18px] 2xl:text-[20px]",
  "before:absolute before:left-[10px] before:top-1/2 before:size-1 before:-translate-y-1/2 before:rounded-full before:bg-[#B2B2B2]"
);

const linkClass =
  "inline-block transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer
      data-slot="footer"
      className={cn(
        "relative w-full overflow-hidden bg-[#565656] font-normal text-white",
        "px-4 pt-8 sm:px-8 sm:pt-10 xl:px-12 2xl:px-20 2xl:pt-[42px]",
        className
      )}
    >
      
      <div
        className={cn(
          "relative z-10 grid grid-cols-1 pb-4 sm:pb-5 2xl:pb-[2px]",
          "md:grid-cols-2 md:gap-y-9",
          "lg:grid-cols-[1.15fr_0.85fr_1fr] lg:gap-y-0"
        )}
      >
        {/* Brand + Explore */}
        <div className="min-w-0 md:col-span-2 lg:col-span-1 lg:pr-10 2xl:pr-[60px]">
          <h2 className="text-[40px] font-semibold leading-[100%] tracking-[0%] text-white sm:text-[52px] xl:text-[60px] 2xl:text-[67px]">
            FT WORLD
          </h2>

          <p className="mt-5 max-w-[540px] text-[15px] font-normal leading-[1.5] tracking-[0%] text-[#B2B2B2] sm:text-[16px] lg:mt-10 2xl:mt-[56px] 2xl:text-[18px]">
            A modern destination for toner, ink, cartridges and printing essentials.
          </p>

          <h3 className={cn(headingClass, "mt-7 2xl:mt-8")}>Explore</h3>
          <ul className={listClass}>
            {EXPLORE_LINKS.map(({ label, href }) => (
              <li key={label} className={listItemClass}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

       
        <nav
          aria-label="Quick links"
          className={cn(
            "min-w-0 mt-7 border-t border-[#525252] pt-7",
            "md:mt-0 md:border-t-0 md:pt-0",
            "lg:relative lg:pl-12 xl:pl-20 2xl:pl-[130px]",
            "lg:before:absolute lg:before:bottom-0 lg:before:left-0 lg:before:top-0 lg:before:w-px lg:before:bg-[#525252]"
          )}
        >
          <h3 className={cn(headingClass, "2xl:mt-2")}>Quick links</h3>
          <ul className={listClass}>
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={label} className={listItemClass}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={cn(
            "min-w-0 mt-7 border-t border-[#525252] pt-7",
            "md:relative md:mt-0 md:border-t-0 md:pt-0 md:pl-10",
            "lg:pl-12 xl:pl-20 2xl:pl-[130px]",
            "md:before:absolute md:before:bottom-0 md:before:left-0 md:before:top-0 md:before:w-px md:before:bg-[#525252]"
          )}
        >
          <h3 className={cn(headingClass, "uppercase 2xl:mt-2")}>Stay Connected</h3>

          <p className="mt-4 max-w-[440px] text-[16px] font-normal leading-[1.5] tracking-[0%] text-[#B2B2B2] sm:text-[18px] 2xl:mt-5 2xl:text-[20px]">
            Subscribe to our newsletter for exclusive deals and updates.
          </p>

          <form
            className="mt-4 flex w-full max-w-[425px] gap-2 2xl:mt-5"
            action="#"
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="Your Email Address"
              className={cn(
                "h-[43px] min-w-0 flex-1 rounded-[8px] border border-[#542452] bg-[#D9D9D9] px-[17px] py-[3px]",
                "text-[16px] font-normal leading-[35px] text-black placeholder:text-[#6E6E6E] sm:text-[18px]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              )}
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className={cn(
                "grid h-[43px] w-[63px] shrink-0 place-items-center rounded-[10px] bg-[#542452] px-3 py-[9px] text-white",
                "transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              )}
            >
              <Send className="size-6" strokeWidth={1.6} aria-hidden="true" />
            </button>
          </form>

          <h4 className="mt-5 flex items-center gap-2 text-[21px] font-semibold leading-[100%] text-white sm:text-[24px] 2xl:mt-[22px] 2xl:text-[27px]">
            <Image src={Email} width={30} height={30} alt="" aria-hidden="true" />
            E Mail
          </h4>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className={cn(
              linkClass,
              "mt-3 break-all text-[16px] font-normal text-[#B2B2B2] sm:text-[18px] 2xl:mt-[18px] 2xl:text-[20px]"
            )}
          >
            {SUPPORT_EMAIL}
          </a>

          <ul className="mt-7 flex flex-wrap gap-3.5 sm:gap-5 2xl:mt-[70px] 2xl:gap-[21px]">
            {SOCIALS.map(({ label, href, icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className={cn(
                    "grid size-12 place-items-center rounded-[10px] bg-[#542452] text-white sm:size-[54px]",
                    "transition hover:-translate-y-0.5 hover:brightness-125",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-[26px] sm:size-[30px]" aria-hidden="true">
                    {icon}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-start gap-2 border-t border-[#525252] pt-4",
          "text-[14px] font-normal leading-[1.2] tracking-[0%] text-white",
          "md:flex-row md:items-center md:justify-between md:gap-6 md:text-[16px] xl:text-[20px] 2xl:pt-[18px] 2xl:text-[24px]"
        )}
      >
        <p>© 2026 FT WORLD. All rights reserved. · Interactive front-end prototype</p>
        <p>
          <Link href="/terms-of-service" className="hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          |{" "}
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Watermark logo */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none relative z-0 mt-3 h-[80px] select-none overflow-hidden sm:h-[130px] lg:h-[210px] 2xl:mt-[30px] 2xl:h-[290px]",
          "[mask-image:linear-gradient(to_bottom,#000_40%,transparent_100%)]"
        )}
      >
        <Image
          src={LogoWatermark}
          alt=""
          fill
          sizes="100vw"
          className="object-contain object-top opacity-20"
        />
      </div>
    </footer>
  );
};

export default Footer;