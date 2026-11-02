"use client";


import Link from "next/link";
import Image from "next/image";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import NavSearchBar from "../NavSearchBar";
import LOGO_SRC from "../../../../public/images/logo.png"
import { useState } from "react";


export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Toner",
    href: "/toner",
    children: [
      { label: "Toner Cartridge", href: "/toner/toner-cartridge" },
      { label: "Toner Bottle", href: "/toner/toner-bottle" },
      { label: "Multicolor Toner", href: "/toner/multicolor-toner" },
    ],
  },
  { label: "Cartridge", href: "/cartridge" },
  { label: "Accessories", href: "/accessories" },
  { label: "Ink bottle", href: "/ink-bottle" },
  { label: "Drum Unit", href: "/drum-unit" },
  { label: "Drum and Developer", href: "/drum-and-developer" },
];

const NAV_GAPS = [
  "mr-1 2xl:mr-[22px]",
  "mr-1 2xl:mr-[23px]",
  "mr-1 2xl:mr-[13px]",
  "mr-1 2xl:mr-[3px]",
  "mr-1 2xl:mr-[2px]",
  "",
];

const PROFILE_HREF = "/account";
const CART_HREF = "/cart";

interface NavbarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

const linkText =
  "text-[16px] font-medium leading-[100%] tracking-[0%] text-black";

const Navbar = ({ onSearch, className }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header
      data-slot="navbar"
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full",
        "bg-[#FFFFFF33] backdrop-blur-[10px]",
        className
      )}
    >
      <div
        className={cn(
          "flex w-full items-center justify-between gap-[10px]",
          "h-[72px] px-4 py-3",
          "sm:h-[90px] sm:px-8",
          "xl:h-[115px] xl:px-6 xl:py-[30px]",
          "2xl:px-20"
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="FTWorld home"
          className="shrink-0"
          onClick={closeMenu}
        >
          <Image
            src={LOGO_SRC}
            alt="FTWorld"
            width={315}
            height={55}
            priority
            className="h-auto w-[130px] sm:w-[180px] xl:w-[160px] 2xl:w-[315px]"
          />
        </Link>

        {/* Desktop links */}
        <nav
          aria-label="Primary"
          className="hidden min-w-0 flex-1 items-center justify-center xl:flex"
        >
          <ul className="flex items-center">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.label} className={cn("group relative", NAV_GAPS[index])}>
                <Link
                  href={item.href}
                  className={cn(
                    linkText,
                    "block whitespace-nowrap rounded-full px-3 py-[6px]",
                    "transition-colors hover:bg-white focus-visible:bg-white",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    item.children && "group-hover:bg-white group-focus-within:bg-white"
                  )}
                >
                  {item.label}
                </Link>

                {item.children && (
                  <div
                    className={cn(
                      "invisible absolute left-0 top-full z-10 pt-3 opacity-0",
                      "transition-opacity duration-150",
                      "group-hover:visible group-hover:opacity-100",
                      "group-focus-within:visible group-focus-within:opacity-100"
                    )}
                  >
                    <ul className="flex w-max min-w-[200px] flex-col gap-1 rounded-[12px] bg-white/95 p-3 shadow-[0px_0px_4px_0px_#00000040]">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            className={cn(
                              linkText,
                              "block whitespace-nowrap rounded-[8px] px-3 py-2",
                              "transition-colors hover:bg-[#F3E9F2] focus-visible:bg-[#F3E9F2] focus-visible:outline-none"
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Right side: search (desktop), cart section, hamburger (mobile) */}
        <div className="flex shrink-0 items-center gap-3 2xl:gap-4">
          <NavSearchBar
            onSearch={onSearch}
            className="hidden xl:flex xl:w-[200px] 2xl:w-[339px]"
          />

          {/* Profile + cart */}
          <div
            className={cn(
              "flex h-[50px] items-center justify-center gap-4 rounded-[30px] bg-white px-5",
              "shadow-[0px_0px_4px_0px_#00000040]",
              "xl:w-[109px]"
            )}
          >
            <Link
              href={PROFILE_HREF}
              aria-label="Account"
              className="rounded-full text-black transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <User aria-hidden="true" className="size-[22px]" />
            </Link>
            <Link
              href={CART_HREF}
              aria-label="Cart"
              className="rounded-full text-black transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ShoppingCart aria-hidden="true" className="size-[22px]" />
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex size-[44px] items-center justify-center rounded-full bg-white text-black xl:hidden",
              "shadow-[0px_0px_4px_0px_#00000040]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            )}
          >
            {open ? (
              <X aria-hidden="true" className="size-[22px]" />
            ) : (
              <Menu aria-hidden="true" className="size-[22px]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile / tablet panel */}
      {open && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100dvh-72px)] overflow-y-auto bg-white/90 px-4 py-4 backdrop-blur-[10px] sm:px-8 xl:hidden"
        >
        <NavSearchBar
  onSearch={onSearch}
  className="mb-4 h-[46px] max-w-none border border-[#B8B8B8] bg-white shadow-none focus-within:border-[#6E2D6B] [&_svg]:size-[20px]"
/>

          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(linkText, "block rounded-[8px] px-3 py-3 hover:bg-[#F3E9F2]")}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="mb-1 ml-4 flex flex-col border-l border-[#D5D5D5] pl-2">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          onClick={closeMenu}
                          className={cn(
                            linkText,
                            "block rounded-[8px] px-3 py-2 font-normal hover:bg-[#F3E9F2]"
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;