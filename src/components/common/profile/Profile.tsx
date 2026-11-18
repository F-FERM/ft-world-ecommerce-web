"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { cn } from "@/src/lib/utils";
import {
  useCustomerOrders,
  type ApiOrder,
  type ApiOrderItem,
  type ApiAddress,
} from "@/src/api/orders";
import {
  type Address,
  type AddressPayload,
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
} from "@/src/api/address";
import { Edit2, MapPin, Plus, Trash2, X } from "lucide-react";

import { isCustomerLoggedIn } from "@/src/api/useCart";
import { LocalStorage, TOKEN_KEYS } from "@/src/utility/localStorage";
import { mapLoggedUser, useLoggedUser } from "@/src/api/user";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* ------------------------------------------------------------------ */
/* UI types                                                            */
/* ------------------------------------------------------------------ */

/** The three groups used by the filter pills. */
export type OrderGroup = "in-progress" | "delivered" | "cancelled";

export interface Order {
  id: string;
  orderId: string;
  date: string;
  total: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  paymentMethod: string;
  rawStatus: string;
  group: OrderGroup;
  items: ApiOrderItem[];
  address?: ApiAddress;
  note?: string;
}

export interface ProfileUser {
  id?: string;
  username?: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string | number;
  avatar?: string;
  isActive?: boolean;
}

interface ProfileInfoProps {
  /** Optional overrides. Anything provided here wins over the API data. */
  user?: Partial<ProfileUser>;
  ordersEndpoint?: string;
  getAuthToken?: () => string | null | undefined;
  onLogout?: () => void;
  onEditProfile?: () => void;
  profileSection?: ReactNode;

  topOffsetClassName?: string;
  className?: string;
}

type Tab = "dashboard" | "orders" | "profile";
type StatusFilter = "all" | OrderGroup;
type RangeFilter = "all" | "7" | "30" | "365";

/* ------------------------------------------------------------------ */
/* Defaults & helpers                                                  */
/* ------------------------------------------------------------------ */

const FALLBACK_NAME = "Guest";
const FALLBACK_VALUE = "—";

// Clears the fixed header (~120px on desktop, shorter on mobile) + a little breathing room.
const DEFAULT_TOP_OFFSET =
  "pt-[112px] sm:pt-[124px] lg:pt-[144px] 2xl:pt-[156px]";

const PURPLE = "#55234F";

const formatPrice = (value: number) => `AED. ${Number(value || 0).toFixed(2)}`;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "in-progress", label: "In Progress" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const RANGE_OPTIONS: { key: RangeFilter; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "365", label: "Last year" },
];

const GROUP_STYLES: Record<OrderGroup, string> = {
  "in-progress": "bg-[#FFF4D6] text-[#8A5A00]",
  delivered: "bg-[#E3F6E8] text-[#1B6B34]",
  cancelled: "bg-[#FFECEC] text-[#C41E1E]",
};

const PAGE_SIZE = 5;

/** Maps backend statuses (CONFIRMED, SHIPPED, ...) to the three filter groups. */
const toGroup = (status: string): OrderGroup => {
  const s = (status || "").toUpperCase();
  if (["DELIVERED", "COMPLETED"].includes(s)) return "delivered";
  if (
    ["CANCELLED", "CANCELED", "REJECTED", "RETURNED", "REFUNDED", "FAILED"].includes(s)
  )
    return "cancelled";
  return "in-progress";
};

const prettyStatus = (status: string) =>
  (status || "").replace(/[_-]+/g, " ").toLowerCase();

const mapOrder = (o: ApiOrder): Order => ({
  id: o._id,
  orderId: o.orderId,
  date: o.createdAt,
  total: o.totalAmount,
  subtotal: o.subtotal,
  tax: o.tax,
  shippingFee: o.shippingFee,
  discount: o.discount,
  paymentMethod: o.paymentMethod,
  rawStatus: o.status,
  group: toGroup(o.status),
  items: o.items ?? [],
  address: o.shippingAddress,
  note: o.orderNote,
});

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ------------------------------------------------------------------ */
/* Icons (inline, no extra dependency)                                 */
/* ------------------------------------------------------------------ */

type IconName =
  | "dashboard"
  | "orders"
  | "user"
  | "logout"
  | "cart"
  | "dollar"
  | "edit"
  | "search"
  | "chevron";

const ICONS: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  orders: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.7 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 7H6" />
    </>
  ),
  dollar: (
    <>
      <path d="M12 2v20" />
      <path d="M17 6.5C16 5 14.3 4.5 12 4.5c-2.8 0-4.5 1.2-4.5 3.2 0 4.8 9.5 2.3 9.5 7.3 0 2-1.9 3.5-5 3.5-2.4 0-4.2-.7-5.2-2.2" />
    </>
  ),
  edit: (
    <>
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.4 2.6a2 2 0 0 1 2.9 2.9L12 14.8 8 16l1.2-4Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
};

const Icon = ({ name, className }: { name: IconName; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={cn("size-4 shrink-0", className)}
  >
    {ICONS[name]}
  </svg>
);

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const Avatar = ({
  src,
  name,
  className,
}: {
  src?: string;
  name: string;
  className?: string;
}) => (
  <div
    className={cn(
      "relative shrink-0 overflow-hidden rounded-full bg-[#979797]",
      className
    )}
  >
    {src && <Image src={src} alt={name} fill sizes="120px" className="object-cover" />}
  </div>
);

const NAV_ITEMS: { key: Tab; label: string; icon: IconName }[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "orders", label: "My Orders", icon: "orders" },
  { key: "profile", label: "My Profile", icon: "user" },
];

const ErrorBox = ({
  message,
  onRetry,
  label = "Couldn't load your orders.",
}: {
  message: string;
  onRetry: () => void;
  label?: string;
}) => (
  <div
    role="alert"
    className="flex flex-col items-start gap-3 text-[14px] text-[#C41E1E] sm:flex-row sm:items-center sm:justify-between sm:text-[16px]"
  >
    <p>
      {label} {message}
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-full px-4 py-1.5 text-[12px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E2D6B] sm:text-[13px]"
      style={{ backgroundColor: PURPLE }}
    >
      Try again
    </button>
  </div>
);

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: IconName;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-[16px] bg-[#F1F1F1] px-4 py-4 sm:rounded-[20px] sm:px-6 sm:py-5 2xl:px-8 2xl:py-6">
    <div className="min-w-0">
      <p className="text-[14px] font-normal leading-[150%] text-[#616161] sm:text-[18px] 2xl:text-[22px]">
        {label}
      </p>
      <p className="truncate text-[24px] font-semibold leading-[120%] text-black sm:text-[28px] 2xl:text-[34px]">
        {value}
      </p>
    </div>
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black sm:size-11 2xl:size-12">
      <Icon name={icon} className="size-4 sm:size-5" />
    </span>
  </div>
);

const InfoItem = ({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading?: boolean;
}) => (
  <div className="min-w-0 text-center sm:text-left">
    <p className="text-[13px] font-normal leading-[150%] text-[#616161] sm:text-[16px] 2xl:text-[20px]">
      {label}
    </p>
    {loading ? (
      <div
        aria-hidden="true"
        className="mx-auto mt-1 h-4 w-40 animate-pulse rounded bg-[#E5E5E5] sm:mx-0"
      />
    ) : (
      <p className="break-all text-[14px] font-medium leading-[150%] text-black sm:text-[16px] 2xl:text-[20px]">
        {value}
      </p>
    )}
  </div>
);

const DashboardSection = ({
  user,
  userLoading,
  userError,
  onRetryUser,
  orders,
  loading,
  error,
  onRetry,
  onEditProfile,
}: {
  user: ProfileUser;
  userLoading: boolean;
  userError: string | null;
  onRetryUser: () => void;
  orders: Order[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEditProfile?: () => void;
}) => {
  // Cancelled orders are not counted as money spent.
  const totalSpent = orders
    .filter((o) => o.group !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const countText = loading ? "Loading.." : error ? "—" : String(orders.length);
  const spentText = loading ? "Loading" : error ? "—" : totalSpent.toFixed(2);

  return (
    <section aria-labelledby="dashboard-heading">
      <h2
        id="dashboard-heading"
        className="mb-3 text-[20px] font-semibold leading-[150%] text-black sm:mb-4 sm:text-[24px] 2xl:text-[28px]"
      >
        My Account Dashboard
      </h2>

      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 2xl:gap-6"
        aria-busy={loading}
      >
        <StatCard label="Total Orders" value={countText} icon="cart" />
        <StatCard label="Total Spent" value={spentText} icon="dollar" />
      </div>

      {error && (
        <div className="mt-3 rounded-[16px] bg-[#FFECEC] px-4 py-3 sm:mt-4 sm:rounded-[20px] sm:px-6">
          <ErrorBox message={error} onRetry={onRetry} />
        </div>
      )}

      {userError && (
        <div className="mt-3 rounded-[16px] bg-[#FFECEC] px-4 py-3 sm:mt-4 sm:rounded-[20px] sm:px-6">
          <ErrorBox
            label="Couldn't load your profile."
            message={userError}
            onRetry={onRetryUser}
          />
        </div>
      )}

      <div
        className="mt-3 rounded-[16px] bg-[#F1F1F1] px-4 py-4 sm:mt-4 sm:rounded-[20px] sm:px-6 sm:py-5 2xl:mt-6 2xl:px-8 2xl:py-6"
        aria-busy={userLoading}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[18px] font-semibold leading-[150%] text-black sm:text-[22px] 2xl:text-[26px]">
            Your Profile
          </h3>
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center gap-1.5 rounded-md text-[12px] font-normal text-black transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E2D6B] sm:text-[14px]"
          >
            <Icon name="edit" className="size-3 sm:size-3.5" />
            Edit
          </button>
        </div>

        <div className="mt-3 flex flex-col items-center gap-4 sm:mt-4 sm:flex-row sm:gap-8 2xl:gap-12">
          <Avatar
            src={user.avatar}
            name={user.name}
            className="size-[72px] sm:size-[88px] 2xl:size-[104px]"
          />
          <div className="grid w-full min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] sm:gap-6">
            <InfoItem
              label="Username"
              value={user.username || user.name}
              loading={userLoading}
            />
            <InfoItem
              label="Phone Number"
              value={user.phone}
              loading={userLoading}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const OrderCard = ({ order }: { order: Order }) => {
  const [open, setOpen] = useState(false);
  const panelId = `order-${order.id}`;
  const a = order.address;
  const addressLine = a
    ? [a.addressLine1, a.addressLine2, a.street, a.city, a.state, a.postalCode, a.country]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <li className="rounded-[14px] bg-white">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[14px] px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E2D6B]"
      >
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-black sm:text-[16px]">
            Order #{order.orderId}
          </p>
          <p className="text-[12px] text-[#616161] sm:text-[14px]">
            {formatDate(order.date)} · {order.items.length}{" "}
            {order.items.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[12px] font-medium capitalize sm:text-[13px]",
              GROUP_STYLES[order.group]
            )}
          >
            {prettyStatus(order.rawStatus)}
          </span>
          <span className="text-[14px] font-semibold text-black sm:text-[16px]">
            {formatPrice(order.total)}
          </span>
          <Icon
            name="chevron"
            className={cn("transition-transform", open && "rotate-180")}
          />
        </div>
      </button>

      {open && (
        <div
          id={panelId}
          className="border-t border-[#E5E5E5] px-4 py-3 text-[13px] text-black sm:text-[14px]"
        >
          <ul className="flex flex-col gap-3">
            {order.items.map((item, i) => (
              <li key={`${item.product}-${i}`} className="flex items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-[10px] bg-[#F1F1F1] sm:size-14">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="size-full object-contain"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-[#616161]">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-medium">{formatPrice(item.total)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
            <dt className="text-[#616161]">Subtotal</dt>
            <dd className="text-right">{formatPrice(order.subtotal)}</dd>
            <dt className="text-[#616161]">Tax</dt>
            <dd className="text-right">{formatPrice(order.tax)}</dd>
            <dt className="text-[#616161]">Shipping</dt>
            <dd className="text-right">{formatPrice(order.shippingFee)}</dd>
            {order.discount > 0 && (
              <>
                <dt className="text-[#616161]">Discount</dt>
                <dd className="text-right">- {formatPrice(order.discount)}</dd>
              </>
            )}
            <dt className="font-semibold">Total</dt>
            <dd className="text-right font-semibold">{formatPrice(order.total)}</dd>
          </dl>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[#616161]">Payment</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            {a && (
              <div className="min-w-0">
                <p className="text-[#616161]">Ship to</p>
                <p className="font-medium">{a.fullName}</p>
                {addressLine && <p className="break-words">{addressLine}</p>}
                {a.phone && <p>{a.phone}</p>}
              </div>
            )}
          </div>

          {order.note && (
            <p className="mt-3 text-[#616161]">
              Note: <span className="text-black">{order.note}</span>
            </p>
          )}
        </div>
      )}
    </li>
  );
};

const OrdersSkeleton = () => (
  <ul className="flex flex-col gap-3" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <li
        key={i}
        className="flex animate-pulse items-center justify-between gap-4 rounded-[14px] bg-white px-4 py-4"
      >
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-32 rounded bg-[#E5E5E5]" />
          <div className="h-3 w-24 rounded bg-[#EFEFEF]" />
        </div>
        <div className="h-6 w-20 rounded-full bg-[#E5E5E5]" />
      </li>
    ))}
  </ul>
);

const OrdersSection = ({
  orders,
  loading,
  error,
  onRetry,
}: {
  orders: Order[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [range, setRange] = useState<RangeFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff =
      range === "all" ? null : Date.now() - Number(range) * 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      if (status !== "all" && o.group !== status) return false;
      if (q && !o.orderId.toLowerCase().includes(q)) return false;
      if (cutoff && new Date(o.date).getTime() < cutoff) return false;
      return true;
    });
  }, [orders, query, status, range]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetPage = () => setPage(1);

  const pill =
    "rounded-full px-4 py-1.5 text-[13px] font-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E2D6B] sm:px-5 sm:py-2 sm:text-[14px] 2xl:text-[16px]";

  return (
    <section aria-labelledby="orders-heading">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2
          id="orders-heading"
          className="text-[20px] font-semibold leading-[150%] text-black sm:text-[24px] 2xl:text-[28px]"
        >
          My Orders
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block sm:w-[240px] 2xl:w-[300px]">
            <span className="sr-only">Search by order</span>
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-black"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetPage();
              }}
              placeholder="Search by order..."
              className="h-10 w-full rounded-full border border-[#E5E5E5] bg-white pl-10 pr-4 text-[13px] text-black placeholder:text-[#616161] focus-visible:outline-2 focus-visible:outline-[#6E2D6B] sm:text-[14px]"
            />
          </label>

          <label className="relative block sm:w-[140px]">
            <span className="sr-only">Filter by date</span>
            <select
              value={range}
              onChange={(e) => {
                setRange(e.target.value as RangeFilter);
                resetPage();
              }}
              className="h-10 w-full appearance-none rounded-full border border-[#E5E5E5] bg-white pl-4 pr-9 text-[13px] text-[#616161] focus-visible:outline-2 focus-visible:outline-[#6E2D6B] sm:text-[14px]"
            >
              {RANGE_OPTIONS.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
            <Icon
              name="chevron"
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-black"
            />
          </label>
        </div>
      </div>

      {/* Status filters: scroll sideways on very narrow screens */}
      <div
        role="tablist"
        aria-label="Order status"
        className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:mt-4 [&::-webkit-scrollbar]:hidden"
      >
        {STATUS_TABS.map((t) => {
          const active = status === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setStatus(t.key);
                resetPage();
              }}
              className={cn(
                pill,
                "shrink-0 whitespace-nowrap border",
                active
                  ? "border-transparent text-white"
                  : "border-[#E5E5E5] bg-white text-[#616161] hover:border-[#6E2D6B]"
              )}
              style={active ? { backgroundColor: PURPLE } : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* List / loading / error / empty */}
      <div
        className="mt-3 min-h-[120px] rounded-[16px] bg-[#F1F1F1] p-4 sm:mt-4 sm:rounded-[20px] sm:p-6"
        aria-busy={loading}
      >
        {loading ? (
          <OrdersSkeleton />
        ) : error ? (
          <ErrorBox message={error} onRetry={onRetry} />
        ) : visible.length === 0 ? (
          <p className="text-[14px] font-normal text-[#616161] sm:text-[16px]">
            {orders.length === 0
              ? "You haven't placed any orders yet."
              : "No orders match the selected filters."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-[16px] bg-[#F1F1F1] px-4 py-3 sm:rounded-[20px] sm:px-5">
        <p className="text-[12px] font-normal text-black sm:text-[13px]">
          Showing page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          {(
            [
              { label: "Previous", disabled: currentPage <= 1, next: currentPage - 1 },
              { label: "Next", disabled: currentPage >= totalPages, next: currentPage + 1 },
            ] as const
          ).map((b) => (
            <button
              key={b.label}
              type="button"
              disabled={b.disabled}
              onClick={() => setPage(b.next)}
              className="rounded-full px-4 py-1.5 text-[12px] font-medium text-white transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E2D6B] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:text-[13px]"
              style={{ backgroundColor: PURPLE }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Address Modal & Profile Section                                    */
/* ------------------------------------------------------------------ */

const BLANK_ADDRESS: AddressPayload = {
  fullName: "",
  phone: "",
  street: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  isDefault: false,
};

function AddressModal({
  initial,
  onSave,
  onClose,
  saving,
  title,
}: {
  initial: AddressPayload;
  onSave: (payload: AddressPayload) => void;
  onClose: () => void;
  saving: boolean;
  title: string;
}) {
  const [form, setForm] = useState<AddressPayload>(initial);

  const set = (k: keyof AddressPayload, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const fields: {
    key: keyof AddressPayload;
    label: string;
    required?: boolean;
    placeholder?: string;
  }[] = [
    { key: "fullName", label: "Full Name", required: true, placeholder: "e.g. John Doe" },
    { key: "phone", label: "Phone Number", required: true, placeholder: "e.g. +971 50 123 4567" },
    { key: "street", label: "Street", required: true, placeholder: "e.g. Sheikh Zayed Road" },
    { key: "addressLine1", label: "Address Line 1", required: true, placeholder: "e.g. Apartment / Villa No." },
    { key: "addressLine2", label: "Address Line 2 (Optional)", placeholder: "e.g. Building / Landmark" },
    { key: "city", label: "City", required: true, placeholder: "e.g. Dubai" },
    { key: "state", label: "State / Emirate", required: true, placeholder: "e.g. Dubai" },
    { key: "country", label: "Country", required: true, placeholder: "e.g. United Arab Emirates" },
    { key: "postalCode", label: "Postal / Zip Code", required: true, placeholder: "e.g. 00000" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const { key, label, required } of fields) {
      if (required && !String(form[key] ?? "").trim()) {
        alert(`${label} is required`);
        return;
      }
    }
    onSave(form);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
          <h3 className="text-[18px] font-semibold text-black sm:text-[20px]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[#616161] hover:bg-[#F1F1F1] hover:text-black"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map(({ key, label, required, placeholder }) => (
              <div
                key={key}
                className={cn(
                  key === "addressLine1" || key === "addressLine2" || key === "street"
                    ? "sm:col-span-2"
                    : ""
                )}
              >
                <label className="mb-1 block text-[12px] font-medium text-[#444]">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={String(form[key] ?? "")}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="h-[42px] w-full rounded-[8px] border border-[#D5D5D5] bg-[#F9F9F9] px-3 text-[13px] text-black placeholder:text-[#999] focus:border-[#55234F] focus:bg-white focus:outline-none"
                />
              </div>
            ))}
          </div>

          <label className="mt-2 flex cursor-pointer select-none items-center gap-2 text-[13px] text-black">
            <input
              type="checkbox"
              checked={!!form.isDefault}
              onChange={(e) => set("isDefault", e.target.checked)}
              className="size-4 accent-[#55234F]"
            />
            <span>Set as default shipping address</span>
          </label>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-[44px] rounded-[10px] border border-[#D5D5D5] px-5 text-[14px] font-medium text-black transition-colors hover:bg-[#F6F6F6] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-[44px] rounded-[10px] bg-[#55234F] px-6 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ProfileSection = ({
  user,
  userLoading,
  userError,
  onRetryUser,
}: {
  user: ProfileUser;
  userLoading: boolean;
  userError: string | null;
  onRetryUser: () => void;
}) => {
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Address;
  }>({ open: false, mode: "add" });

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    isError: isAddressesError,
    error: addressesError,
    refetch: refetchAddresses,
  } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const handleSaveAddress = (payload: AddressPayload) => {
    if (modalState.mode === "edit" && modalState.data) {
      updateAddress.mutate(
        { id: modalState.data._id, payload },
        {
          onSuccess: () => setModalState({ open: false, mode: "add" }),
        }
      );
    } else {
      createAddress.mutate(payload, {
        onSuccess: () => setModalState({ open: false, mode: "add" }),
      });
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteAddress.mutate(id);
    }
  };

  const handleSetDefault = (addr: Address) => {
    updateAddress.mutate({
      id: addr._id,
      payload: { ...addr, isDefault: true },
    });
  };

  const saving = createAddress.isPending || updateAddress.isPending;

  return (
    <section className="space-y-6">
      {/* 1. Profile Information Card */}
      <div className="rounded-[16px] bg-[#F1F1F1] p-4 sm:rounded-[20px] sm:p-6 2xl:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-black sm:text-[24px]">
              Personal Information
            </h2>
            <p className="text-[12px] text-[#616161] sm:text-[14px]">
              View your account details and profile information
            </p>
          </div>
          {userError && (
            <button
              type="button"
              onClick={onRetryUser}
              className="text-[12px] font-medium text-[#55234F] underline hover:opacity-80"
            >
              Retry loading
            </button>
          )}
        </div>

        {userError && (
          <div className="mt-3">
            <ErrorBox
              label="Couldn't load profile details."
              message={userError}
              onRetry={onRetryUser}
            />
          </div>
        )}

        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar
            src={user.avatar}
            name={user.name}
            className="size-[84px] shrink-0 sm:size-[100px] 2xl:size-[112px]"
          />

          <div className="grid w-full min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[12px] bg-white p-3.5 shadow-sm">
              <span className="text-[11px] font-normal uppercase tracking-wider text-[#757575]">
                Full Name
              </span>
              <p className="mt-1 truncate text-[14px] font-semibold text-black sm:text-[15px]">
                {user.name || FALLBACK_VALUE}
              </p>
            </div>

            <div className="rounded-[12px] bg-white p-3.5 shadow-sm">
              <span className="text-[11px] font-normal uppercase tracking-wider text-[#757575]">
                Username
              </span>
              <p className="mt-1 truncate text-[14px] font-semibold text-black sm:text-[15px]">
                {user.username || user.name || FALLBACK_VALUE}
              </p>
            </div>

            <div className="rounded-[12px] bg-white p-3.5 shadow-sm">
              <span className="text-[11px] font-normal uppercase tracking-wider text-[#757575]">
                Email Address
              </span>
              <p className="mt-1 truncate text-[14px] font-semibold text-black sm:text-[15px]">
                {user.email || FALLBACK_VALUE}
              </p>
            </div>

            <div className="rounded-[12px] bg-white p-3.5 shadow-sm">
              <span className="text-[11px] font-normal uppercase tracking-wider text-[#757575]">
                Phone Number
              </span>
              <p className="mt-1 truncate text-[14px] font-semibold text-black sm:text-[15px]">
                {user.phone || FALLBACK_VALUE}
              </p>
            </div>

            <div className="rounded-[12px] bg-white p-3.5 shadow-sm">
              <span className="text-[11px] font-normal uppercase tracking-wider text-[#757575]">
                Member Since
              </span>
              <p className="mt-1 truncate text-[14px] font-semibold text-black sm:text-[15px]">
                {user.memberSince !== FALLBACK_VALUE ? `Year ${user.memberSince}` : FALLBACK_VALUE}
              </p>
            </div>

            <div className="rounded-[12px] bg-white p-3.5 shadow-sm">
              <span className="text-[11px] font-normal uppercase tracking-wider text-[#757575]">
                Account Status
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-[14px] font-semibold text-emerald-700">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Address CRUD Management */}
      <div className="rounded-[16px] bg-[#F1F1F1] p-4 sm:rounded-[20px] sm:p-6 2xl:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-black sm:text-[24px]">
              Saved Addresses
            </h2>
            <p className="text-[12px] text-[#616161] sm:text-[14px]">
              Manage your delivery addresses for quick checkout
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalState({ open: true, mode: "add" })}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#55234F] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 sm:text-[14px]"
          >
            <Plus className="size-4" />
            Add New Address
          </button>
        </div>

        {addressesLoading ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-[14px] bg-white p-4"
              />
            ))}
          </div>
        ) : isAddressesError ? (
          <div className="mt-4">
            <ErrorBox
              label="Failed to load addresses."
              message={(addressesError as Error)?.message || "Please try again"}
              onRetry={refetchAddresses}
            />
          </div>
        ) : addresses.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[#D5D5D5] bg-white p-8 text-center">
            <MapPin className="size-10 text-[#55234F]" />
            <h3 className="mt-2 text-[16px] font-semibold text-black">
              No addresses saved yet
            </h3>
            <p className="mt-1 text-[13px] text-[#616161]">
              Add your delivery address to speed up checkout.
            </p>
            <button
              type="button"
              onClick={() => setModalState({ open: true, mode: "add" })}
              className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-[#55234F] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" />
              Add Address
            </button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={cn(
                  "relative flex flex-col justify-between rounded-[14px] border bg-white p-4 transition-shadow hover:shadow-md sm:p-5",
                  addr.isDefault ? "border-[#55234F] ring-1 ring-[#55234F]" : "border-[#E5E5E5]"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-semibold text-black">
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <span className="rounded-full bg-[#55234F] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[13px] font-medium text-[#55234F]">
                    {addr.phone}
                  </p>

                  <div className="mt-2 text-[13px] leading-relaxed text-[#525252]">
                    <p>
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    </p>
                    <p>{addr.street}</p>
                    <p>
                      {addr.city}, {addr.state}, {addr.country} - {addr.postalCode}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#F1F1F1] pt-3">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr)}
                      disabled={updateAddress.isPending}
                      className="text-[12px] font-medium text-[#55234F] underline hover:opacity-80"
                    >
                      Set as default
                    </button>
                  ) : (
                    <span className="text-[12px] font-medium text-[#757575]">
                      Default address
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setModalState({ open: true, mode: "edit", data: addr })
                      }
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-black hover:bg-[#F6F6F6]"
                    >
                      <Edit2 className="size-3.5 text-[#55234F]" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr._id)}
                      disabled={deleteAddress.isPending}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Add / Edit Modal */}
      {modalState.open && (
        <AddressModal
          title={modalState.mode === "add" ? "Add New Address" : "Edit Address"}
          initial={
            modalState.data
              ? {
                  fullName: modalState.data.fullName,
                  phone: modalState.data.phone,
                  street: modalState.data.street,
                  addressLine1: modalState.data.addressLine1,
                  addressLine2: modalState.data.addressLine2 ?? "",
                  city: modalState.data.city,
                  state: modalState.data.state,
                  country: modalState.data.country,
                  postalCode: modalState.data.postalCode,
                  isDefault: modalState.data.isDefault,
                }
              : BLANK_ADDRESS
          }
          onSave={handleSaveAddress}
          onClose={() => setModalState({ open: false, mode: "add" })}
          saving={saving}
        />
      )}
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

const ProfileInfo = ({
  user,
  onLogout,
  onEditProfile,
  profileSection,
  topOffsetClassName = DEFAULT_TOP_OFFSET,
  className,
}: ProfileInfoProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    setMounted(true);
    if (!isCustomerLoggedIn()) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirect_after_login", "/account");
      }
      router.push("/login?redirect=account");
    }
  }, [router]);

  const enabled = mounted && isCustomerLoggedIn();

  /* --- Logged-in user: GET /user/logged-user --- */
  const {
    data: apiUser,
    isLoading: userLoading,
    isError: isUserError,
    error: userQueryError,
    refetch: refetchUser,
  } = useLoggedUser({ enabled });

  const userError = isUserError
    ? (userQueryError as Error)?.message || "Failed to load profile"
    : null;
  const reloadUser = useCallback(() => {
    refetchUser();
  }, [refetchUser]);

  /* --- Orders --- */
  const {
    data: apiOrders = [],
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useCustomerOrders({ enabled });

  const orders: Order[] = useMemo(() => apiOrders.map(mapOrder), [apiOrders]);
  const error = isError
    ? (queryError as Error)?.message || "Failed to load orders"
    : null;
  const reload = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    LocalStorage.removeItem(TOKEN_KEYS.customer);
    LocalStorage.removeItem("customer_refresh_token");
    router.push("/login");
  };

  /**
   * Priority: props override -> /user/logged-user -> latest order address -> fallback.
   */
  const displayUser: ProfileUser = useMemo(() => {
    const latestAddress = orders[0]?.address;
    const fromApi = apiUser ? mapLoggedUser(apiUser) : undefined;

    return {
      id: fromApi?.id,
      username: fromApi?.username,
      name:
        user?.name?.trim() ||
        fromApi?.name ||
        latestAddress?.fullName ||
        FALLBACK_NAME,
      email: user?.email || fromApi?.email || FALLBACK_VALUE,
      phone:
        user?.phone ||
        fromApi?.phone ||
        latestAddress?.phone ||
        FALLBACK_VALUE,
      memberSince: user?.memberSince || fromApi?.memberSince || FALLBACK_VALUE,
      avatar: user?.avatar || fromApi?.avatar,
      isActive: fromApi?.isActive,
    };
  }, [user, apiUser, orders]);

  if (!mounted) {
    return (
      <div
        className={cn(
          poppins.className,
          "mx-auto w-full max-w-[1440px] px-4 pb-10 sm:px-6 sm:pb-12 lg:px-10 lg:pb-16 2xl:px-[60px]",
          topOffsetClassName,
          className
        )}
      >
        <div className="mb-6 h-10 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-96 w-full animate-pulse rounded-[20px] bg-gray-100" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        poppins.className,
        "mx-auto w-full max-w-[1440px] px-4 pb-10 sm:px-6 sm:pb-12 lg:px-10 lg:pb-16 2xl:px-[60px]",
        topOffsetClassName,
        className
      )}
    >
      <h1 className="relative z-10 mb-4 text-[28px] font-semibold leading-[100%] text-black sm:mb-6 sm:text-[36px] lg:mb-8 lg:text-[44px] 2xl:text-[50px]">
        Profile Info
      </h1>

      <div className="grid grid-cols-1 gap-6 rounded-[20px] border border-[#E5E5E5] bg-white p-4 sm:rounded-[24px] sm:p-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:p-8 2xl:grid-cols-[300px_minmax(0,1fr)] 2xl:gap-12 2xl:p-10">
        {/* Sidebar */}
        <aside className="flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <Avatar
              src={displayUser.avatar}
              name={displayUser.name}
              className="size-[84px] sm:size-[100px] 2xl:size-[120px]"
            />
            <div className="text-center" aria-busy={userLoading}>
              {userLoading ? (
                <div
                  aria-hidden="true"
                  className="mx-auto h-5 w-28 animate-pulse rounded bg-[#E5E5E5]"
                />
              ) : (
                <p className="text-[18px] font-medium leading-[100%] text-black sm:text-[20px] 2xl:text-[22px]">
                  {displayUser.name}
                </p>
              )}
              {!userLoading && displayUser.memberSince !== FALLBACK_VALUE && (
                <p className="mt-1.5 text-[11px] font-normal text-[#616161] sm:text-[12px]">
                  since {displayUser.memberSince}
                </p>
              )}
            </div>
          </div>

          <nav
            aria-label="Account"
            className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1"
          >
            {NAV_ITEMS.map((item) => {
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setTab(item.key)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E2D6B] sm:text-[14px] 2xl:text-[15px]",
                    active
                      ? "border-transparent text-white"
                      : "border-[#E5E5E5] bg-white text-black hover:border-[#6E2D6B]"
                  )}
                  style={active ? { backgroundColor: PURPLE } : undefined}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <hr className="border-[#E5E5E5]" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded-[10px] bg-[#FFECEC] px-3 py-2.5 text-left text-[13px] font-medium text-[#E01E1E] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E01E1E] sm:text-[14px] 2xl:text-[15px]"
          >
            <Icon name="logout" />
            Log Out
          </button>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          {tab === "dashboard" && (
            <DashboardSection
              user={displayUser}
              userLoading={userLoading}
              userError={userError}
              onRetryUser={reloadUser}
              orders={orders}
              loading={loading}
              error={error}
              onRetry={reload}
              onEditProfile={onEditProfile ?? (() => setTab("profile"))}
            />
          )}
          {tab === "orders" && (
            <OrdersSection
              orders={orders}
              loading={loading}
              error={error}
              onRetry={reload}
            />
          )}
          {tab === "profile" &&
            (profileSection ?? (
              <ProfileSection
                user={displayUser}
                userLoading={userLoading}
                userError={userError}
                onRetryUser={reloadUser}
              />
            ))}
        </main>
      </div>
    </div>
  );
};

export default ProfileInfo;