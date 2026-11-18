"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Menu, ShoppingCart, User, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import NavSearchBar from "../NavSearchBar";
import LOGO_SRC from "../../../../public/images/logo.png";
import CartDrawer from "../CartDrawer";
import { useCart, isCustomerLoggedIn } from "@/src/api/useCart";
import { guestCart } from "@/src/utility/localStorage";

/* ------------------------------- types ------------------------------- */

export interface NavChild {
  id: string;
  label: string;
  href: string;
}

/** Parents have no href: they only label / open their children. */
export interface NavItem {
  id: string;
  label: string;
  children?: NavChild[];
}

interface ApiSubCategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isDeleted: boolean;
}

interface ApiCategory extends ApiSubCategory {
  subcategories?: ApiSubCategory[];
}

interface CategoryTreeResponse {
  success: boolean;
  data: ApiCategory[];
}

/* ---------------------- fetch + mapper (module level) ---------------------- */

const fetchCategoryTree = async (): Promise<CategoryTreeResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/categories/tree`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

const isVisible = (c: ApiSubCategory) => c.isActive && !c.isDeleted;

const mapCategoryTree = ({ data }: CategoryTreeResponse): NavItem[] =>
  data.filter(isVisible).map((parent) => {
    const children: NavChild[] = (parent.subcategories ?? [])
      .filter(isVisible)
      .map((sub) => ({
        id: sub._id,
        label: sub.name,
        href: `/${parent.slug}/${sub.slug}`,
      }));

    return {
      id: parent._id,
      label: parent.name,
      ...(children.length > 0 && { children }),
    };
  });

/* ------------------------------ constants ------------------------------ */

const PROFILE_HREF = "/account";
const SKELETON_COUNT = 5;

const linkText =
  "text-[16px] font-medium leading-[100%] tracking-[0%] text-black";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

/* --------------------------- small UI pieces --------------------------- */

const DesktopSkeleton = () => (
  <ul className="flex items-center justify-center gap-3" aria-hidden="true">
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <li
        key={i}
        className="h-[30px] w-[70px] animate-pulse rounded-full bg-black/10 2xl:w-[90px]"
      />
    ))}
  </ul>
);

const MobileSkeleton = () => (
  <ul className="flex flex-col gap-2" aria-hidden="true">
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <li key={i} className="h-[44px] animate-pulse rounded-[8px] bg-black/10" />
    ))}
  </ul>
);

const desktopParentClass = cn(
  linkText,
  "flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-[6px]",
  "text-[14px] 2xl:text-[16px]"
);

const DesktopNavItem = memo(function DesktopNavItem({
  item,
}: {
  item: NavItem;
}) {
  return (
    <li className="group relative">
      {item.children ? (
        <button
          type="button"
          aria-haspopup="true"
          className={cn(
            desktopParentClass,
            "cursor-default transition-colors hover:bg-white focus-visible:bg-white",
            "group-hover:bg-white group-focus-within:bg-white",
            focusRing
          )}
        >
          {item.label}
          <ChevronDown
            aria-hidden="true"
            className="size-[14px] transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
          />
        </button>
      ) : (
        <span className={desktopParentClass}>{item.label}</span>
      )}

      {item.children && (
        <div
          className={cn(
            "invisible absolute left-0 top-full z-10 pt-3 opacity-0",
            "transition-opacity duration-150",
            "group-hover:visible group-hover:opacity-100",
            "group-focus-within:visible group-focus-within:opacity-100"
          )}
        >
          <ul className="flex max-h-[70vh] w-max min-w-[200px] max-w-[320px] flex-col gap-1 overflow-y-auto rounded-[12px] bg-white/95 p-3 shadow-[0px_0px_4px_0px_#00000040]">
            {item.children.map((child) => (
              <li key={child.id}>
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
  );
});

const MobileNavItem = memo(function MobileNavItem({
  item,
  isExpanded,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onNavigate: () => void;
}) {
  const panelId = `sub-${item.id}`;

  return (
    <li className="border-b border-[#EDEDED] last:border-b-0">
      {item.children ? (
        <>
          {/* Whole parent row toggles the submenu (no link) */}
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={panelId}
            onClick={() => onToggle(item.id)}
            className={cn(
              linkText,
              "flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left hover:bg-[#F3E9F2]",
              focusRing
            )}
          >
            {item.label}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-[20px] shrink-0 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>

          {isExpanded && (
            <ul
              id={panelId}
              className="mb-2 ml-4 flex flex-col border-l border-[#D5D5D5] pl-2"
            >
              {item.children.map((child) => (
                <li key={child.id}>
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    className={cn(
                      linkText,
                      "block rounded-[8px] px-3 py-2.5 font-normal hover:bg-[#F3E9F2]"
                    )}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <span className={cn(linkText, "block px-3 py-3")}>{item.label}</span>
      )}
    </li>
  );
});

/* ------------------------------ component ------------------------------ */

interface NavbarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

const Navbar = ({ onSearch, className }: NavbarProps) => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  // which parent is expanded in the mobile panel
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // cart item count: API count for logged-in customer, localStorage count for guest
  const { data: cartLines = [] } = useCart({ enabled: mounted });
  const cartCount = useMemo(
    () =>
      mounted
        ? cartLines.reduce((sum, l) => sum + l.quantity, 0)
        : 0,
    [mounted, cartLines]
  );

  const closeMenu = useCallback(() => {
    setOpen(false);
    setExpanded(null);
  }, []);

  const toggleExpanded = useCallback(
    (id: string) => setExpanded((prev) => (prev === id ? null : id)),
    []
  );

  const { data: navItems = [], isLoading } = useQuery({
    queryKey: ["nav-categories-tree"],
    queryFn: fetchCategoryTree,
    select: mapCategoryTree,
    staleTime: 10 * 60 * 1000,
  });

  // lock page scroll while the mobile panel is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // close the mobile panel when the viewport grows to desktop (xl = 1280px)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) closeMenu();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [closeMenu]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

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
          "flex w-full items-center justify-between gap-2 sm:gap-[10px]",
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
            className="h-auto w-[120px] min-[400px]:w-[130px] sm:w-[180px] xl:w-[160px] 2xl:w-[315px]"
          />
        </Link>

        {/* Desktop links (xl and up) */}
        <nav
          aria-label="Primary"
          className="hidden min-w-0 flex-1 items-center justify-center xl:flex"
        >
          {isLoading ? (
            <DesktopSkeleton />
          ) : (
            navItems.length > 0 && (
              <ul className="flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1 2xl:gap-x-3">
                {navItems.map((item) => (
                  <DesktopNavItem key={item.id} item={item} />
                ))}
              </ul>
            )
          )}
        </nav>

        {/* Right side: search (desktop), profile + cart, hamburger (mobile/tablet) */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3 2xl:gap-4">
          <NavSearchBar
            onSearch={onSearch}
            className="hidden xl:flex xl:w-[200px] 2xl:w-[339px]"
          />

          {/* Profile + cart */}
          <div
            className={cn(
              "flex items-center justify-center gap-3 rounded-[30px] bg-white px-4",
              "h-[44px] sm:h-[50px] sm:gap-4 sm:px-5",
              "shadow-[0px_0px_4px_0px_#00000040]",
              "xl:w-[109px]"
            )}
          >
            <Link
              href={PROFILE_HREF}
              aria-label="Account"
              onClick={closeMenu}
              className={cn(
                "rounded-full text-black transition-colors hover:text-primary",
                focusRing
              )}
            >
              <User aria-hidden="true" className="size-[20px] sm:size-[22px]" />
            </Link>
            <button
              type="button"
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}
              aria-haspopup="dialog"
              onClick={() => {
                closeMenu();
                setCartOpen(true);
              }}
              className={cn(
                "relative rounded-full text-black transition-colors hover:text-primary",
                focusRing
              )}
            >
              <ShoppingCart
                aria-hidden="true"
                className="size-[20px] sm:size-[22px]"
              />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#6E2D6B] px-[3px] text-[10px] font-semibold leading-none text-white"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
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
              focusRing
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

      {/* Mobile / tablet panel (below xl) */}
      {open && (
        <div
          id="mobile-menu"
          className={cn(
            "overflow-y-auto overscroll-contain bg-white/95 px-4 py-4 backdrop-blur-[10px] xl:hidden",
            "max-h-[calc(100dvh-72px)] sm:max-h-[calc(100dvh-90px)] sm:px-8"
          )}
        >
          <NavSearchBar
            onSearch={onSearch}
            className="mb-4 h-[46px] max-w-none border border-[#B8B8B8] bg-white shadow-none focus-within:border-[#6E2D6B] [&_svg]:size-[20px]"
          />

          {isLoading ? (
            <MobileSkeleton />
          ) : (
            navItems.length > 0 && (
              <ul className="mx-auto flex max-w-[640px] flex-col sm:max-w-none">
                {navItems.map((item) => (
                  <MobileNavItem
                    key={item.id}
                    item={item}
                    isExpanded={expanded === item.id}
                    onToggle={toggleExpanded}
                    onNavigate={closeMenu}
                  />
                ))}
              </ul>
            )
          )}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};

export default Navbar;