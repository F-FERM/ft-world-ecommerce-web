"use client";

import Image, { type StaticImageData } from "next/image";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BadgePercent,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  Edit2,
  MapPin,
  Package,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import {
  CartLine,
  CartProduct,
  getErrorMessage,
  isCustomerLoggedIn,
  useAddToCart,
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/src/api/useCart";
import {
  type Address,
  type AddressPayload,
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
} from "@/src/api/address";
import { usePlaceOrder, type PaymentMethod } from "@/src/api/orders";
import {
  useWishlist,
  useClearWishlist,
  useRemoveFromWishlist,
} from "@/src/api/wishlist";

/* ---------------------------------- Types --------------------------------- */

type Tab = "cart" | "recent";
type Panel = "note" | "shipping" | "discount" | "payment" | null;
type ShippingView = "list" | "form";

export interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  recentlyViewed?: CartProduct[];
  /** Cart subtotal needed to unlock free shipping */
  freeShippingThreshold?: number;
  /** Called after a recently viewed product is added to the cart */
  onAddRecent?: (product: CartProduct) => void;
  onApplyNote?: (note: string) => void;
  onApplyDiscount?: (code: string) => void;
  className?: string;
}

/* ------------------------------ Default data ------------------------------ */

const EMPTY_LINES: CartLine[] = [];
const EMPTY_RECENT: CartProduct[] = [];

/* --------------------------------- Helpers -------------------------------- */

const CURRENCY = "AED.";
const BRAND = "bg-[#55244F] hover:bg-[#6B2D63]";
const formatPrice = (n: number) => `${CURRENCY} ${n.toFixed(2)}`;

// keeps content clear of the iPhone home bar / Android gesture bar
const SAFE_BOTTOM = "pb-[max(1.25rem,env(safe-area-inset-bottom))]";

const fieldClass = cn(
  "w-full rounded-[8px] border border-[#BDBDBD] bg-[#E0E0E0] text-black",
  "px-4 text-[14px] font-normal placeholder:text-[#676767] 2xl:text-[16px]",
  "focus-visible:border-[#55244F] focus-visible:outline-none"
);

const inputH = "h-[46px] sm:h-[50px] 2xl:h-[56px]";

const BLANK_FORM: AddressPayload = {
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

/* ---------------------------- Small sub-components ------------------------- */

const ProductImage = ({
  src,
  alt,
}: {
  src: StaticImageData | string;
  alt: string;
}) => (
  <div className="relative h-[56px] w-[84px] shrink-0 overflow-hidden rounded-[8px] border border-[#55244F] bg-white sm:h-[64px] sm:w-[96px] 2xl:h-[72px] 2xl:w-[110px]">
    <Image src={src} alt={alt} fill sizes="110px" className="object-contain p-1" />
  </div>
);

const ProductInfo = ({ product }: { product: CartProduct }) => (
  <div className="min-w-0 flex-1">
    <h3 className="line-clamp-2 break-words text-[15px] font-semibold capitalize leading-[1.2] text-black sm:text-[17px] 2xl:text-[20px]">
      {product.title}
    </h3>
    <p className="mt-1.5 break-words text-[10px] font-normal uppercase leading-[1.2] text-black sm:text-[11px] 2xl:mt-2 2xl:text-[12px]">
      {product.compatibleWith}
    </p>
    <p className="mt-1 break-words text-[10px] font-normal capitalize leading-[1.3] text-[#525252] sm:text-[11px] 2xl:text-[12px]">
      {product.compatibleModels}
    </p>
    <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 2xl:mt-2">
      <span className="text-[13px] font-semibold capitalize leading-none text-black sm:text-[14px] 2xl:text-[16px]">
        {formatPrice(product.price)}
      </span>
      {product.compareAtPrice !== undefined && (
        <span className="text-[10px] font-normal capitalize leading-none text-[#464646] line-through sm:text-[11px] 2xl:text-[12px]">
          {formatPrice(product.compareAtPrice)}
        </span>
      )}
    </p>
  </div>
);

const QuantityStepper = ({
  value,
  max,
  label,
  onChange,
}: {
  value: number;
  max?: number;
  label: string;
  onChange: (next: number) => void;
}) => (
  <div
    role="group"
    aria-label={`Quantity for ${label}`}
    className="flex h-[36px] w-[68px] items-center justify-center gap-2 rounded-full border border-[#D5D5D5] bg-white sm:h-[40px] sm:w-[76px] 2xl:h-[44px] 2xl:w-[84px]"
  >
    <span
      aria-live="polite"
      className="text-[16px] font-medium leading-none text-black 2xl:text-[18px]"
    >
      {value}
    </span>
    <div className="flex flex-col">
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={max !== undefined && value >= max}
        onClick={() => onChange(value + 1)}
        className="rounded-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/40 disabled:opacity-40"
      >
        <ChevronUp aria-hidden="true" className="size-[14px]" />
      </button>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="rounded-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/40 disabled:opacity-40"
      >
        <ChevronDown aria-hidden="true" className="size-[14px]" />
      </button>
    </div>
  </div>
);

const ApplyButton = ({
  children = "Apply",
  onClick,
  disabled,
}: {
  children?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      BRAND,
      "h-[46px] w-full rounded-[8px] text-[16px] font-semibold uppercase text-white transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/50 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-60",
      "sm:h-[50px] 2xl:h-[56px] 2xl:text-[22px]"
    )}
  >
    {children}
  </button>
);

const ActionPanel = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "shrink-0 space-y-3 bg-[#EAEAEA] px-4 pt-5 sm:px-6 2xl:space-y-4 2xl:px-[36px] 2xl:pb-6 2xl:pt-6",
      SAFE_BOTTOM
    )}
  >
    <div className="flex items-center justify-between">
      <h3 className="text-[15px] font-normal capitalize leading-none text-black 2xl:text-[18px]">
        {title}
      </h3>
      <button
        type="button"
        aria-label={`Close ${title}`}
        onClick={onClose}
        className="rounded-full p-1 text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/40"
      >
        <X aria-hidden="true" className="size-[20px]" />
      </button>
    </div>
    {children}
  </div>
);

const LineSkeleton = () => (
  <li
    aria-hidden="true"
    className="flex animate-pulse items-center gap-3 rounded-[8px] border border-[#E5E5E5] bg-white p-2.5 2xl:gap-4 2xl:p-3"
  >
    <div className="h-[56px] w-[84px] shrink-0 rounded-[8px] bg-[#EBEBEB] sm:h-[64px] sm:w-[96px] 2xl:h-[72px] 2xl:w-[110px]" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-3/4 rounded bg-[#EBEBEB]" />
      <div className="h-2.5 w-1/2 rounded bg-[#EBEBEB]" />
      <div className="h-2.5 w-1/3 rounded bg-[#EBEBEB]" />
    </div>
    <div className="h-9 w-[68px] shrink-0 rounded-full bg-[#EBEBEB]" />
  </li>
);

/* -------------------- Address Form -------------------- */

function AddressForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: AddressPayload;
  onSave: (data: AddressPayload) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<AddressPayload>(initial);

  const set = (k: keyof AddressPayload, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const fields: { key: keyof AddressPayload; label: string; required?: boolean }[] = [
    { key: "fullName", label: "Full Name", required: true },
    { key: "phone", label: "Phone", required: true },
    { key: "street", label: "Street", required: true },
    { key: "addressLine1", label: "Address Line 1", required: true },
    { key: "addressLine2", label: "Address Line 2 (optional)" },
    { key: "city", label: "City", required: true },
    { key: "state", label: "State", required: true },
    { key: "country", label: "Country", required: true },
    { key: "postalCode", label: "Postal Code", required: true },
  ];

  const handleSubmit = () => {
    for (const { key, label, required } of fields) {
      if (required && !String(form[key] ?? "").trim()) {
        alert(`${label} is required`);
        return;
      }
    }
    onSave(form);
  };

  return (
    <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
      {fields.map(({ key, label }) => (
        <input
          key={key}
          type="text"
          aria-label={label}
          placeholder={label}
          value={String(form[key] ?? "")}
          onChange={(e) => set(key, e.target.value)}
          className={cn(fieldClass, inputH)}
        />
      ))}

      <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-black">
        <input
          type="checkbox"
          checked={!!form.isDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
          className="h-4 w-4 accent-[#55244F]"
        />
        Set as default address
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-[44px] flex-1 rounded-[8px] border border-[#BDBDBD] text-[14px] font-medium text-black transition-colors hover:bg-white/60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className={cn(
            BRAND,
            "h-[44px] flex-1 rounded-[8px] text-[14px] font-semibold text-white transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {saving ? "Saving…" : "Save Address"}
        </button>
      </div>
    </div>
  );
}

/* -------------------- Address List Panel -------------------- */

function ShippingPanel({
  onClose,
  selectedId,
  onSelect,
}: {
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [view, setView] = useState<ShippingView>("list");
  const [editing, setEditing] = useState<Address | null>(null);

  const { data: addresses = [], isLoading } = useAddresses();
  const createAddr = useCreateAddress();
  const updateAddr = useUpdateAddress();
  const deleteAddr = useDeleteAddress();

  /* auto-select default (or first) address when nothing is selected */
  useEffect(() => {
    if (!selectedId && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      onSelect(def._id);
    }
  }, [addresses, selectedId, onSelect]);

  const openAdd = () => {
    setEditing(null);
    setView("form");
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setView("form");
  };

  const handleSave = (payload: AddressPayload) => {
    if (editing) {
      updateAddr.mutate(
        { id: editing._id, payload },
        {
          onSuccess: () => {
            setView("list");
            setEditing(null);
          },
        }
      );
    } else {
      createAddr.mutate(payload, {
        onSuccess: (res) => {
          setView("list");
          if (res.data?._id) onSelect(res.data._id);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteAddr.mutate(id, {
      onSuccess: () => {
        if (selectedId === id) onSelect("");
      },
    });
  };

  const saving = createAddr.isPending || updateAddr.isPending;

  return (
    <ActionPanel title="Shipping Address" onClose={onClose}>
      {view === "form" ? (
        <AddressForm
          initial={
            editing
              ? {
                  fullName: editing.fullName,
                  phone: editing.phone,
                  street: editing.street,
                  addressLine1: editing.addressLine1,
                  addressLine2: editing.addressLine2 ?? "",
                  city: editing.city,
                  state: editing.state,
                  country: editing.country,
                  postalCode: editing.postalCode,
                  isDefault: editing.isDefault,
                }
              : BLANK_FORM
          }
          onSave={handleSave}
          onCancel={() => setView("list")}
          saving={saving}
        />
      ) : (
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-[13px] text-[#676767]">
              Loading addresses…
            </p>
          ) : addresses.length === 0 ? (
            <p className="text-center text-[13px] text-[#676767]">
              No saved addresses yet.
            </p>
          ) : (
            <ul className="max-h-[46vh] space-y-2 overflow-y-auto pr-1">
              {addresses.map((addr) => {
                const isSelected = addr._id === selectedId;
                return (
                  <li
                    key={addr._id}
                    onClick={() => onSelect(addr._id)}
                    className={cn(
                      "cursor-pointer rounded-[8px] border p-3 text-[13px] transition-colors",
                      isSelected
                        ? "border-[#55244F] bg-[#f8f0f8]"
                        : "border-[#D5D5D5] bg-white hover:border-[#55244F]/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-black">
                          {addr.fullName}
                          {addr.isDefault && (
                            <span className="ml-2 text-[11px] font-normal text-[#55244F]">
                              (Default)
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 truncate text-[#525252]">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""},{" "}
                          {addr.street}
                        </p>
                        <p className="truncate text-[#525252]">
                          {addr.city}, {addr.state}, {addr.country} —{" "}
                          {addr.postalCode}
                        </p>
                        <p className="mt-0.5 text-[#676767]">{addr.phone}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {/* Radio indicator */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-0.5 h-[16px] w-[16px] shrink-0 rounded-full border-2 transition-colors",
                            isSelected
                              ? "border-[#55244F] bg-[#55244F]"
                              : "border-[#D5D5D5] bg-white"
                          )}
                        />
                        <button
                          type="button"
                          aria-label="Edit address"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(addr);
                          }}
                          className="rounded p-1 text-[#525252] hover:text-[#55244F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/40"
                        >
                          <Edit2 aria-hidden="true" className="size-[14px]" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete address"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(addr._id);
                          }}
                          disabled={deleteAddr.isPending}
                          className="rounded p-1 text-[#FF4D4D] hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D4D]/40 disabled:opacity-50"
                        >
                          <Trash2 aria-hidden="true" className="size-[14px]" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            onClick={openAdd}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-[8px] border-2 border-dashed border-[#BDBDBD]",
              "py-3 text-[13px] font-medium text-[#676767] transition-colors hover:border-[#55244F] hover:text-[#55244F]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/40"
            )}
          >
            <Plus aria-hidden="true" className="size-[14px]" />
            Add New Address
          </button>

          <ApplyButton onClick={onClose} disabled={!selectedId}>
            Deliver to this address
          </ApplyButton>
        </div>
      )}
    </ActionPanel>
  );
}

/* -------------------- Payment Method Panel -------------------- */

function PaymentPanel({
  onClose,
  selectedMethod,
  onSelect,
}: {
  onClose: () => void;
  selectedMethod: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>(selectedMethod);

  return (
    <ActionPanel title="Payment Method" onClose={onClose}>
      <div className="space-y-2 py-2">
        {(["COD", "ONLINE"] as PaymentMethod[]).map((m) => (
          <label
            key={m}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-[8px] border p-3.5 text-[14px] font-medium transition-colors",
              method === m
                ? "border-[#55244F] bg-[#f8f0f8] text-[#55244F]"
                : "border-[#D5D5D5] bg-white text-[#525252] hover:border-[#55244F]/50"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "size-4 rounded-full border-2 transition-colors",
                  method === m
                    ? "border-[#55244F] bg-[#55244F]"
                    : "border-[#D5D5D5] bg-white"
                )}
              />
              <span>
                {m === "COD" ? "Cash on Delivery (COD)" : "Online Payment"}
              </span>
            </div>
            <input
              type="radio"
              name="panel-payment-method"
              value={m}
              checked={method === m}
              onChange={() => setMethod(m)}
              className="sr-only"
            />
          </label>
        ))}
      </div>
      <ApplyButton
        onClick={() => {
          onSelect(method);
          onClose();
        }}
      >
        Save Payment Method
      </ApplyButton>
    </ActionPanel>
  );
}

/* -------------------------------- Component -------------------------------- */

const CartDrawer = ({
  open,
  onClose,
  recentlyViewed: recentlyViewedProp = EMPTY_RECENT,
  freeShippingThreshold = 135,
  onAddRecent,
  onApplyNote,
  onApplyDiscount,
  className,
}: CartDrawerProps) => {
  const uid = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("cart");
  const [panel, setPanel] = useState<Panel>(null);
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [mounted, setMounted] = useState(false);
  // Recently viewed: manage locally so we can remove individual items
  const [recentlyViewed, setRecentlyViewed] = useState<CartProduct[]>(
    recentlyViewedProp
  );
  // Sync if prop changes
  useEffect(() => {
    setRecentlyViewed(recentlyViewedProp);
  }, [recentlyViewedProp]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loggedIn = mounted && isCustomerLoggedIn();
  const { data: wishlistProducts = [], isLoading: isWishlistLoading } =
    useWishlist({ enabled: open && loggedIn });
  const clearWishlist = useClearWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const wishlistAsCartProducts: CartProduct[] = useMemo(() => {
    return wishlistProducts.map((p: any) => ({
      id: p._id || p.id,
      title: p.name || p.title || "Product",
      compatibleWith: p.compatibleWith || p.category || p.slug || "",
      compatibleModels: p.compatibleModels || "",
      price: Number(p.price ?? p.originalPrice ?? 0),
      compareAtPrice:
        p.compareAtPrice ??
        (p.price && p.originalPrice && p.originalPrice > p.price
          ? p.originalPrice
          : undefined),
      image:
        (Array.isArray(p.images) && p.images[0]) ||
        p.image ||
        "/placeholder.png",
    }));
  }, [wishlistProducts]);

  const displayRecentList = loggedIn ? wishlistAsCartProducts : recentlyViewed;

  const { data: addresses = [] } = useAddresses({ enabled: open });
  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(def._id);
    }
  }, [addresses, selectedAddressId]);

  const placeOrder = usePlaceOrder({
    onSuccess: () => {
      onClose();
    },
  });

  /* ------------------------------ Cart data ------------------------------ */

  const {
    data: lines = EMPTY_LINES,
    isLoading,
    isError,
    error,
    refetch,
  } = useCart({ enabled: open });

  const addToCart = useAddToCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  const changeQuantity = (productId: string, quantity: number) => {
    updateItem.mutate({ productId, quantity });
  };

  const removeLine = (productId: string, name: string) => {
    removeItem.mutate({ productId, name });
  };

  const handleClear = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => setConfirmClear(false),
    });
  };

  /* ---- Recently viewed / Wishlist: remove helpers ---- */
  const handleRemoveRecent = (id: string) => {
    if (loggedIn) {
      removeFromWishlist.mutate(id);
    } else {
      setRecentlyViewed((prev) => prev.filter((p) => p.id !== id));
    }
  };
  const handleClearAllRecent = () => {
    if (loggedIn) {
      clearWishlist.mutate();
    } else {
      setRecentlyViewed([]);
    }
  };

  const handleAddRecent = (product: CartProduct) => {
    addToCart.mutate(
      { productId: product.id, quantity: 1, name: product.title },
      {
        onSuccess: () => {
          onAddRecent?.(product);
          setTab("cart");
        },
      }
    );
  };

  /* ------------------------------ Buy Now ------------------------------ */

  const handleBuyNow = () => {
    if (!isCustomerLoggedIn()) {
      // Save return destination and redirect to login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirect_after_login", window.location.pathname);
      }
      onClose();
      router.push("/login?redirect=cart");
      return;
    }

    if (!selectedAddressId) {
      alert("Please select a shipping address first.");
      setPanel("shipping");
      return;
    }

    placeOrder.mutate({
      addressId: selectedAddressId,
      paymentMethod,
      productIds: lines.map((l) => l.id),
      couponCode: code.trim() || undefined,
      orderNote: note.trim() || undefined,
    });
  };

  /* ------------------------------ Drawer UX ------------------------------ */

  // Escape to close, scroll lock and focus handling while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  // Reset to the Cart tab with no sub-panel each time it opens
  useEffect(() => {
    if (open) {
      setTab("cart");
      setPanel(null);
      setConfirmClear(false);
    }
  }, [open]);

  // Nothing left to clear -> drop the confirmation
  useEffect(() => {
    if (lines.length === 0) setConfirmClear(false);
  }, [lines.length]);

  /* ------------------------------- Totals -------------------------------- */

  const { subtotal, itemCount } = useMemo(
    () => ({
      subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    [lines]
  );
  const remaining = Math.max(freeShippingThreshold - subtotal, 0);
  const progress =
    freeShippingThreshold > 0
      ? Math.min((subtotal / freeShippingThreshold) * 100, 100)
      : 100;

  /* ------------------------------- Helpers ------------------------------- */

  const tabClass = (active: boolean) =>
    cn(
      "font-semibold capitalize tracking-[0px] transition-colors",
      "text-[22px] leading-[36px] sm:text-[32px] sm:leading-[52px] 2xl:text-[45px] 2xl:leading-[70px]",
      "focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4",
      active ? "text-black" : "text-[#BDBDBD] hover:text-[#8E8E8E]"
    );

  const actionButton = (
    id: Exclude<Panel, "order" | null>,
    label: string,
    icon: ReactNode
  ) => (
    <button
      type="button"
      onClick={() => setPanel(id)}
      className={cn(
        "flex min-w-0 flex-1 items-center justify-center gap-2 px-2 py-4 2xl:py-5",
        "text-[13px] font-normal capitalize leading-none text-black sm:text-[15px] 2xl:text-[18px]",
        "transition-colors hover:bg-[#F6F6F6] focus-visible:bg-[#F6F6F6] focus-visible:outline-none",
        "[&_svg]:size-[16px] [&_svg]:shrink-0 sm:[&_svg]:size-[18px] 2xl:[&_svg]:size-[20px]",
        "[&:not(:first-child)]:border-l [&:not(:first-child)]:border-[#D5D5D5]"
      )}
    >
      {icon}
      <span className="truncate pb-[2px] leading-[1.3]">{label}</span>
    </button>
  );

  const cartBody = () => {
    if (isLoading) {
      return (
        <ul className="mt-4 space-y-3 2xl:mt-5" aria-busy="true">
          <LineSkeleton />
          <LineSkeleton />
        </ul>
      );
    }

    if (isError) {
      return (
        <div
          role="alert"
          className="mt-8 flex flex-col items-center gap-3 text-center text-[14px] text-[#676767] 2xl:text-[16px]"
        >
          <p>{getErrorMessage(error)}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full border border-[#55244F] px-4 py-1.5 text-[13px] font-medium text-[#55244F] transition-colors hover:bg-[#55244F] hover:text-white"
          >
            Try again
          </button>
        </div>
      );
    }

    if (lines.length === 0) {
      return (
        <p className="mt-10 text-center text-[14px] text-[#676767] 2xl:text-[16px]">
          Your cart is empty.
        </p>
      );
    }

    return (
      <>
        {/* Item count + clear cart */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 2xl:mt-5">
          <p className="text-[12px] text-[#676767] 2xl:text-[14px]">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>

          {confirmClear ? (
            <div className="flex items-center gap-2 text-[12px] 2xl:text-[14px]">
              <span className="text-black">Remove all items?</span>
              <button
                type="button"
                onClick={handleClear}
                disabled={clearCart.isPending}
                className="rounded-full bg-[#FF4D4D] px-3 py-1 font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D4D]/40 disabled:opacity-60"
              >
                {clearCart.isPending ? "Clearing..." : "Yes, clear"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                disabled={clearCart.isPending}
                className="rounded-full border border-[#D5D5D5] px-3 py-1 font-medium text-black transition-colors hover:bg-[#F6F6F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/40"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="rounded-sm text-[12px] font-normal text-[#FF4D4D] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D4D]/40 2xl:text-[14px]"
            >
              Clear cart
            </button>
          )}
        </div>

        <ul className="mt-3 space-y-3">
          {lines.map((line) => (
            <li
              key={line.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-3 rounded-[8px] border border-[#E5E5E5] bg-white p-2.5 sm:gap-x-4 2xl:p-3"
            >
              <div className="flex min-w-0 flex-1 basis-[220px] items-center gap-3 2xl:gap-4">
                <ProductImage src={line.image} alt={line.title} />
                <ProductInfo product={line} />
              </div>

              <div className="ml-auto flex items-center gap-3 sm:gap-4 2xl:gap-6">
                <QuantityStepper
                  value={line.quantity}
                  max={line.stock && line.stock > 0 ? line.stock : undefined}
                  label={line.title}
                  onChange={(q) => changeQuantity(line.id, q)}
                />
                <button
                  type="button"
                  onClick={() => removeLine(line.id, line.title)}
                  aria-label={`Remove ${line.title}`}
                  className="rounded-sm text-[11px] font-normal leading-none text-[#FF4D4D] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D4D]/40 2xl:text-[12px]"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  };

  if (!mounted) return null;

  return (
    <div
      data-slot="cart-drawer"
      className={cn(
        "fixed inset-0 z-[60]",
        open
          ? "visible"
          : "invisible pointer-events-none transition-[visibility] delay-300 motion-reduce:delay-0",
        className
      )}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-[4px] transition-opacity duration-300 motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 right-0 flex h-dvh w-full flex-col overflow-hidden bg-white",
          "sm:w-[480px] sm:rounded-l-[30px] lg:w-[540px] 2xl:w-[640px]",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          "focus-visible:outline-none",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header / tabs */}
        <div className="shrink-0 border-b border-[#D5D5D5] px-4 pt-3 sm:px-6 sm:pt-5 2xl:px-[36px] 2xl:pt-6">
          <div className="flex items-start justify-between gap-3">
            <div
              id={`${uid}-title`}
              role="tablist"
              aria-label="Cart sections"
              className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 sm:gap-x-4"
            >
              <button
                type="button"
                role="tab"
                id={`${uid}-tab-cart`}
                aria-selected={tab === "cart"}
                aria-controls={`${uid}-body`}
                onClick={() => setTab("cart")}
                className={tabClass(tab === "cart")}
              >
                Cart
              </button>
              <button
                type="button"
                role="tab"
                id={`${uid}-tab-recent`}
                aria-selected={tab === "recent"}
                aria-controls={`${uid}-body`}
                onClick={() => setTab("recent")}
                className={tabClass(tab === "recent")}
              >
                Recently viewed
              </button>
            </div>

            {/* Close button: always visible, pinned to the end of the header */}
            <button
              type="button"
              aria-label="Close cart"
              onClick={onClose}
              className={cn(
                "ml-auto flex shrink-0 items-center justify-center rounded-full bg-[#F3F3F3] text-black transition-colors hover:bg-[#E5E5E5]",
                "mt-[2px] size-[32px] sm:mt-[6px] sm:size-[40px] 2xl:mt-[11px] 2xl:size-[48px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/40"
              )}
            >
              <X aria-hidden="true" className="size-[18px] sm:size-[20px] 2xl:size-[24px]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          id={`${uid}-body`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${tab}`}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 2xl:px-[36px] 2xl:py-4"
        >
          {tab === "cart" ? (
            <>
              {/* Free shipping progress */}
              <p className="text-[13px] font-normal leading-none text-black sm:text-[14px] 2xl:text-[16px]">
                {remaining > 0
                  ? `Spend ${formatPrice(remaining)} More To Reach Free Shipping!`
                  : "You’ve Unlocked Free Shipping!"}
              </p>
              <div
                role="progressbar"
                aria-label="Progress to free shipping"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                className="mt-2 h-[6px] w-full overflow-hidden rounded-full bg-[#EBEBEB] 2xl:mt-3"
              >
                <div
                  className="h-full rounded-full bg-[#55244F] transition-[width] duration-300 motion-reduce:transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {cartBody()}
            </>
          ) : isWishlistLoading && loggedIn ? (
            <div className="mt-10 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#55244F] border-t-transparent" />
            </div>
          ) : displayRecentList.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 text-center">
              <p className="text-[14px] text-[#676767] 2xl:text-[16px]">
                {loggedIn
                  ? "No products in your wishlist yet."
                  : "No recently viewed products yet."}
              </p>
            </div>
          ) : (
            <>
              {/* Clear all */}
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-normal text-[#676767]">
                  {displayRecentList.length}{" "}
                  {displayRecentList.length === 1 ? "product" : "products"}
                </p>
                <button
                  type="button"
                  onClick={handleClearAllRecent}
                  disabled={clearWishlist.isPending}
                  className="rounded-sm text-[12px] font-normal text-[#FF4D4D] underline underline-offset-2 hover:opacity-80 focus-visible:outline-none disabled:opacity-50 2xl:text-[13px]"
                >
                  Clear all
                </button>
              </div>

              <ul className="space-y-3">
                {displayRecentList.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center gap-3 rounded-[8px] border border-[#E5E5E5] bg-white p-2.5 2xl:gap-4 2xl:p-3"
                  >
                    <ProductImage src={product.image} alt={product.title} />
                    <ProductInfo product={product} />

                    <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
                      {/* Add to cart */}
                      <button
                        type="button"
                        onClick={() => handleAddRecent(product)}
                        disabled={addToCart.isPending}
                        aria-label={`Add ${product.title} to cart`}
                        className={cn(
                          BRAND,
                          "flex h-[28px] items-center gap-1 rounded-full px-3 text-[11px] font-medium uppercase leading-none text-white transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/50 focus-visible:ring-offset-2",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                          "2xl:h-[32px] 2xl:px-4 2xl:text-[12px]"
                        )}
                      >
                        Add
                        <Plus aria-hidden="true" className="size-[12px]" />
                      </button>

                      {/* Remove this item */}
                      <button
                        type="button"
                        onClick={() => handleRemoveRecent(product.id)}
                        disabled={removeFromWishlist.isPending}
                        aria-label={`Remove ${product.title}`}
                        className="text-[11px] font-normal text-[#FF4D4D] underline underline-offset-1 hover:opacity-80 focus-visible:outline-none disabled:opacity-50 2xl:text-[12px]"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Footer (cart tab only) */}
        {tab === "cart" && (
          <>
            {panel === null && (
              <>
                {/* Order note / Shipping / Payment / Discount */}
                <div className="flex shrink-0 border-t border-[#D5D5D5] bg-white">
                  {actionButton("note", "Order Note", <ClipboardList aria-hidden="true" />)}

                  {/* Shipping: requires login */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isCustomerLoggedIn()) {
                        if (typeof window !== "undefined") {
                          sessionStorage.setItem(
                            "redirect_after_login",
                            window.location.pathname
                          );
                        }
                        onClose();
                        router.push("/login?redirect=cart");
                        return;
                      }
                      setPanel("shipping");
                    }}
                    className={cn(
                      "flex min-w-0 flex-1 items-center justify-center gap-2 px-2 py-4 2xl:py-5",
                      "text-[13px] font-normal capitalize leading-none text-black sm:text-[15px] 2xl:text-[18px]",
                      "transition-colors hover:bg-[#F6F6F6] focus-visible:bg-[#F6F6F6] focus-visible:outline-none",
                      "[&_svg]:size-[16px] [&_svg]:shrink-0 sm:[&_svg]:size-[18px] 2xl:[&_svg]:size-[20px]",
                      "[&:not(:first-child)]:border-l [&:not(:first-child)]:border-[#D5D5D5]"
                    )}
                  >
                    <Package aria-hidden="true" />
                    <span className="truncate pb-[2px] leading-[1.3]">Shipping</span>
                  </button>

                  {/* Payment Method */}
                  <button
                    type="button"
                    onClick={() => setPanel("payment")}
                    className={cn(
                      "flex min-w-0 flex-1 items-center justify-center gap-2 px-2 py-4 2xl:py-5",
                      "text-[13px] font-normal capitalize leading-none text-black sm:text-[15px] 2xl:text-[18px]",
                      "transition-colors hover:bg-[#F6F6F6] focus-visible:bg-[#F6F6F6] focus-visible:outline-none",
                      "[&_svg]:size-[16px] [&_svg]:shrink-0 sm:[&_svg]:size-[18px] 2xl:[&_svg]:size-[20px]",
                      "[&:not(:first-child)]:border-l [&:not(:first-child)]:border-[#D5D5D5]"
                    )}
                  >
                    <CreditCard aria-hidden="true" />
                    <span className="truncate pb-[2px] leading-[1.3]">Payment</span>
                  </button>

                  {actionButton("discount", "Discount", <BadgePercent aria-hidden="true" />)}
                </div>

                {/* Totals + checkout */}
                <div
                  className={cn(
                    "shrink-0 bg-[#EAEAEA] px-4 pt-5 sm:px-6 2xl:px-[36px] 2xl:pb-7 2xl:pt-6",
                    SAFE_BOTTOM
                  )}
                >
                  {/* Separate Shipping Address Card */}
                  {isCustomerLoggedIn() && (
                    <div className="mb-2.5 rounded-[8px] border border-[#D5D5D5] bg-white p-3 text-[12px] sm:text-[13px]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-semibold text-black">
                          <MapPin aria-hidden="true" className="size-4 text-[#55244F]" />
                          Shipping Address
                        </span>
                        <button
                          type="button"
                          onClick={() => setPanel("shipping")}
                          className="font-medium text-[#55244F] underline hover:text-[#6B2D63]"
                        >
                          {selectedAddress ? "Change" : "Select"}
                        </button>
                      </div>
                      {selectedAddress ? (
                        <p className="mt-1 truncate text-[#525252]">
                          <strong className="text-black">{selectedAddress.fullName}</strong> ({selectedAddress.phone}) —{" "}
                          {selectedAddress.addressLine1}, {selectedAddress.city}
                        </p>
                      ) : (
                        <p className="mt-1 text-[#FF4D4D]">⚠ No address selected. Click &quot;Select&quot; above.</p>
                      )}
                    </div>
                  )}

                  {/* Separate Payment Method Card */}
                  {isCustomerLoggedIn() && (
                    <div className="mb-3 rounded-[8px] border border-[#D5D5D5] bg-white p-3 text-[12px] sm:text-[13px]">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-semibold text-black">
                          <CreditCard aria-hidden="true" className="size-4 text-[#55244F]" />
                          Payment Method
                        </span>
                        <button
                          type="button"
                          onClick={() => setPanel("payment")}
                          className="font-medium text-[#55244F] underline hover:text-[#6B2D63]"
                        >
                          Change
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {(["COD", "ONLINE"] as PaymentMethod[]).map((m) => (
                          <label
                            key={m}
                            className={cn(
                              "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border py-1.5 text-[11px] font-medium transition-colors sm:text-[12px]",
                              paymentMethod === m
                                ? "border-[#55244F] bg-[#f8f0f8] text-[#55244F]"
                                : "border-[#D5D5D5] bg-white text-[#525252] hover:border-[#55244F]/50"
                            )}
                          >
                            <input
                              type="radio"
                              name="cart-payment-method"
                              value={m}
                              checked={paymentMethod === m}
                              onChange={() => setPaymentMethod(m)}
                              className="sr-only"
                            />
                            {m === "COD" ? "Cash on Delivery" : "Online Payment"}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-end justify-between gap-4">
                    <p className="max-w-[55%] text-[13px] font-normal capitalize leading-[1.4] text-black sm:text-[15px] 2xl:text-[18px] 2xl:leading-[1.3]">
                      Tax included. Shipping calculated at checkout.
                    </p>
                    <div className="text-right">
                      <p className="text-[13px] font-normal capitalize leading-none text-[#606060] sm:text-[15px] 2xl:text-[18px]">
                        Subtotal
                      </p>
                      <p className="mt-2 text-[17px] font-semibold capitalize leading-none text-black sm:text-[19px] 2xl:text-[22px]">
                        {formatPrice(subtotal)}
                      </p>
                    </div>
                  </div>
                  {/* Guest: show Login button; logged-in: show Buy Now */}
                  {!isCustomerLoggedIn() ? (
                    <div className="mt-4 flex flex-col gap-2 2xl:mt-5">
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            sessionStorage.setItem(
                              "redirect_after_login",
                              window.location.pathname
                            );
                          }
                          onClose();
                          router.push("/login?redirect=cart");
                        }}
                        className={cn(
                          BRAND,
                          "h-[48px] w-full rounded-[8px] text-[16px] font-semibold uppercase text-white transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/50 focus-visible:ring-offset-2",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          "sm:h-[52px] 2xl:h-[60px] 2xl:text-[22px]"
                        )}
                      >
                        Login to Checkout
                      </button>
                      <p className="text-center text-[11px] text-[#676767] 2xl:text-[13px]">
                        You need to be logged in to place an order
                      </p>
                    </div>
                  ) : (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isLoading || isError || lines.length === 0 || placeOrder.isPending}
                    className={cn(
                      BRAND,
                      "mt-4 h-[48px] w-full rounded-[8px] text-[16px] font-semibold uppercase text-white transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/50 focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      "sm:h-[52px] 2xl:mt-5 2xl:h-[60px] 2xl:text-[22px]"
                    )}
                  >
                    {placeOrder.isPending ? "Placing Order…" : "Buy now"}
                  </button>
                  )}
                </div>
              </>
            )}

            {panel === "note" && (
              <ActionPanel title="Order Special Instructions" onClose={() => setPanel(null)}>
                <textarea
                  aria-label="Order note"
                  placeholder="Order Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={cn(fieldClass, "h-[96px] resize-none py-3 sm:h-[110px] 2xl:h-[130px]")}
                />
                <ApplyButton
                  onClick={() => {
                    onApplyNote?.(note.trim());
                    setPanel(null);
                  }}
                />
              </ActionPanel>
            )}

            {panel === "shipping" && (
              <ShippingPanel
                onClose={() => setPanel(null)}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
              />
            )}

            {panel === "payment" && (
              <PaymentPanel
                onClose={() => setPanel(null)}
                selectedMethod={paymentMethod}
                onSelect={setPaymentMethod}
              />
            )}

            {panel === "discount" && (
              <ActionPanel title="Discount" onClose={() => setPanel(null)}>
                <input
                  type="text"
                  aria-label="Discount code"
                  placeholder="Discount Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={cn(fieldClass, inputH)}
                />
                <ApplyButton
                  onClick={() => {
                    onApplyDiscount?.(code.trim());
                    setPanel(null);
                  }}
                />
              </ActionPanel>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;