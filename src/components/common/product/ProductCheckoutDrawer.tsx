"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { cn } from "@/src/lib/utils";
import { ProductDetail } from "@/src/api/products";
import {
  type Address,
  type AddressPayload,
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
} from "@/src/api/address";
import {
  useCreateDirectOrder,
  type PaymentMethod,
} from "@/src/api/orders";

/* ---------------------------------- Helpers --------------------------------- */

const isCustomerLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("customer_access_token"));
};

/* ---------------------------------- Types --------------------------------- */

type Panel = "note" | "shipping" | "discount" | "payment" | null;
type ShippingView = "list" | "form";

export interface ProductCheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  product: ProductDetail;
  initialQuantity?: number;
  className?: string;
}

/* --------------------------------- Helpers -------------------------------- */

const CURRENCY = "AED.";
const BRAND = "bg-[#55244F] hover:bg-[#6B2D63]";
const formatPrice = (n: number) => `${CURRENCY} ${n.toFixed(2)}`;
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

/* -------------------- Shipping Panel -------------------- */

function ShippingPanel({
  onClose,
  selectedId,
  onSelect,
}: {
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const router = useRouter();
  const [view, setView] = useState<ShippingView>("list");
  const [editing, setEditing] = useState<Address | null>(null);

  const { data: addresses = [], isLoading } = useAddresses({
    enabled: isCustomerLoggedIn(),
  });
  const createAddr = useCreateAddress();
  const updateAddr = useUpdateAddress();
  const deleteAddr = useDeleteAddress();

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
      {!isCustomerLoggedIn() ? (
        <div className="rounded-[8px] border border-[#E5E5E5] bg-[#F9F9F9] p-4 text-center">
          <p className="text-[13px] font-medium text-black">
            Please log in to view and manage your saved addresses.
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("redirect_after_login", window.location.pathname);
              }
              onClose();
              router.push(`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`);
            }}
            className={cn(
              BRAND,
              "mt-3 inline-flex h-[40px] items-center justify-center rounded-[8px] px-6 text-[14px] font-medium text-white transition-colors"
            )}
          >
            Login to Continue
          </button>
        </div>
      ) : view === "form" ? (
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
              name="direct-panel-payment"
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

/* ---------------------------- Component ---------------------------- */

export default function ProductCheckoutDrawer({
  open,
  onClose,
  product,
  initialQuantity = 1,
  className,
}: ProductCheckoutDrawerProps) {
  const router = useRouter();
  const uid = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [qty, setQty] = useState(initialQuantity);
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setQty(initialQuantity);
  }, [initialQuantity]);

  useEffect(() => {
    if (open) {
      setPanel(null);
    }
  }, [open]);

  // Escape key handler
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

  const { data: addresses = [] } = useAddresses({
    enabled: open && isCustomerLoggedIn(),
  });
  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  // Auto-select default address
  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(def._id);
    }
  }, [addresses, selectedAddressId]);

  /* Pricing calculations */
  const subtotal = Math.round(product.price * qty * 100) / 100;
  const shippingFee = subtotal >= 135 ? 0 : 10;
  const discountAmount = appliedCoupon ? 10 : 0;
  const tax = 0;
  const totalAmount = Math.max(0, subtotal + tax + shippingFee - discountAmount);

  const createOrder = useCreateDirectOrder({
    onSuccess: () => {
      onClose();
    },
  });

  const handleConfirmOrder = () => {
    if (!isCustomerLoggedIn()) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirect_after_login", window.location.pathname);
      }
      onClose();
      router.push(
        `/login?redirect=${encodeURIComponent(
          typeof window !== "undefined" ? window.location.pathname : "/"
        )}`
      );
      return;
    }

    if (!selectedAddressId) {
      alert("Please select or add a shipping address.");
      setPanel("shipping");
      return;
    }

    createOrder.mutate({
      addressId: selectedAddressId,
      items: [
        {
          product: product.id,
          name: product.fullTitle,
          image: product.gallery?.[0] || "",
          price: product.price,
          quantity: qty,
          total: subtotal,
        },
      ],
      subtotal,
      tax,
      shippingFee,
      discount: discountAmount,
      totalAmount,
      paymentMethod,
      couponCode: appliedCoupon || undefined,
      orderNote: note.trim() || undefined,
    });
  };

  const actionButton = (
    id: Exclude<Panel, null>,
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

  if (!mounted) return null;

  return (
    <div
      data-slot="product-checkout-drawer"
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

      {/* Drawer Panel */}
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
        {/* Header */}
        <div className="shrink-0 border-b border-[#D5D5D5] px-4 pt-3 sm:px-6 sm:pt-5 2xl:px-[36px] 2xl:pt-6">
          <div className="flex items-center justify-between pb-4">
            <h2
              id={`${uid}-title`}
              className="text-[20px] font-semibold text-black sm:text-[24px] 2xl:text-[28px]"
            >
              Quick Checkout
            </h2>
            <button
              type="button"
              aria-label="Close checkout"
              onClick={onClose}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full bg-[#F3F3F3] text-black transition-colors hover:bg-[#E5E5E5]",
                "size-[32px] sm:size-[40px] 2xl:size-[48px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/40"
              )}
            >
              <X aria-hidden="true" className="size-[18px] sm:size-[20px] 2xl:size-[24px]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 2xl:px-[36px]">
          {/* Product card */}
          <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[#E5E5E5] bg-white p-3">
            <div className="relative h-[64px] w-[84px] shrink-0 overflow-hidden rounded-[8px] border border-[#55244F] bg-white sm:h-[72px] sm:w-[96px]">
              {product.gallery?.[0] ? (
                <Image
                  src={product.gallery[0]}
                  alt={product.fullTitle}
                  fill
                  sizes="96px"
                  className="object-contain p-1"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-[14px] font-semibold capitalize text-black sm:text-[16px]">
                {product.fullTitle}
              </h3>
              {product.compatibleFor && (
                <p className="mt-1 text-[11px] uppercase text-[#676767]">
                  {product.compatibleFor}
                </p>
              )}
              <p className="mt-1.5 text-[14px] font-semibold text-black">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Stepper */}
            <div className="ml-auto flex items-center gap-2">
              <div
                role="group"
                aria-label="Quantity"
                className="flex h-[36px] w-[68px] items-center justify-center gap-2 rounded-full border border-[#D5D5D5] bg-white sm:h-[40px] sm:w-[76px]"
              >
                <span className="text-[15px] font-medium text-black">{qty}</span>
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={product.stock > 0 && qty >= product.stock}
                    onClick={() => setQty((q) => q + 1)}
                    className="rounded-sm text-black disabled:opacity-40"
                  >
                    <ChevronUp className="size-[13px]" />
                  </button>
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={qty <= 1}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="rounded-sm text-black disabled:opacity-40"
                  >
                    <ChevronDown className="size-[13px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Selected shipping address preview */}
          {isCustomerLoggedIn() && (
            <div className="mt-4 rounded-[8px] border border-[#E5E5E5] bg-[#F9F9F9] p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-black">
                  <MapPin className="size-[15px] text-[#55244F]" />
                  Shipping Destination
                </span>
                <button
                  type="button"
                  onClick={() => setPanel("shipping")}
                  className="text-[12px] font-medium text-[#55244F] underline hover:text-[#6B2D63]"
                >
                  {selectedAddress ? "Change" : "Select Address"}
                </button>
              </div>

              {selectedAddress ? (
                <div className="mt-2 text-[12px] text-[#525252]">
                  <p className="font-medium text-black">
                    {selectedAddress.fullName} ({selectedAddress.phone})
                  </p>
                  <p>
                    {selectedAddress.addressLine1}
                    {selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ""},{" "}
                    {selectedAddress.street}
                  </p>
                  <p>
                    {selectedAddress.city}, {selectedAddress.state},{" "}
                    {selectedAddress.country} - {selectedAddress.postalCode}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-[12px] text-[#FF4D4D]">
                  ⚠ No shipping address selected. Click &quot;Select Address&quot; above.
                </p>
              )}
            </div>
          )}

          {/* Payment Method preview card */}
          {isCustomerLoggedIn() && (
            <div className="mt-3 rounded-[8px] border border-[#E5E5E5] bg-[#F9F9F9] p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-black">
                  <CreditCard className="size-[15px] text-[#55244F]" />
                  Payment Method
                </span>
                <button
                  type="button"
                  onClick={() => setPanel("payment")}
                  className="text-[12px] font-medium text-[#55244F] underline hover:text-[#6B2D63]"
                >
                  Change
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px]">
                <span className="font-medium text-black">
                  {paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                </span>
                <div className="flex gap-2">
                  {(["COD", "ONLINE"] as PaymentMethod[]).map((m) => (
                    <label
                      key={m}
                      className={cn(
                        "flex cursor-pointer items-center gap-1.5 rounded-[6px] border px-2 py-1 text-[11px] font-medium transition-colors",
                        paymentMethod === m
                          ? "border-[#55244F] bg-[#f8f0f8] text-[#55244F]"
                          : "border-[#D5D5D5] bg-white text-[#525252] hover:border-[#55244F]/50"
                      )}
                    >
                      <input
                        type="radio"
                        name="direct-payment-quick"
                        value={m}
                        checked={paymentMethod === m}
                        onChange={() => setPaymentMethod(m)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "size-2.5 rounded-full border transition-colors",
                          paymentMethod === m
                            ? "border-[#55244F] bg-[#55244F]"
                            : "border-[#D5D5D5] bg-white"
                        )}
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Applied coupon badge / note badge */}
          {(appliedCoupon || note) && (
            <div className="mt-3 space-y-1.5">
              {appliedCoupon && (
                <div className="flex items-center justify-between rounded-[6px] bg-[#E8F5E9] px-3 py-1.5 text-[12px] text-[#2E7D32]">
                  <span>Coupon &quot;{appliedCoupon}&quot; applied</span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon("")}
                    className="text-[#C62828] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              {note && (
                <div className="flex items-center justify-between rounded-[6px] bg-[#FFF8E1] px-3 py-1.5 text-[12px] text-[#F57F17]">
                  <span className="truncate">Note: {note}</span>
                  <button
                    type="button"
                    onClick={() => setNote("")}
                    className="text-[#C62828] hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions and checkout */}
        {panel === null && (
          <>
            {/* Action buttons: Order Note, Shipping, Payment, Discount */}
            <div className="flex shrink-0 border-t border-[#D5D5D5] bg-white">
              {actionButton("note", "Order Note", <ClipboardList aria-hidden="true" />)}
              {actionButton("shipping", "Shipping", <Package aria-hidden="true" />)}
              {actionButton("payment", "Payment", <CreditCard aria-hidden="true" />)}
              {actionButton("discount", "Discount", <BadgePercent aria-hidden="true" />)}
            </div>

            {/* Totals + Place order */}
            <div
              className={cn(
                "shrink-0 bg-[#EAEAEA] px-4 pt-4 sm:px-6 2xl:px-[36px] 2xl:pb-7 2xl:pt-6",
                SAFE_BOTTOM
              )}
            >
              {/* Price Breakdown */}
              <div className="space-y-1 border-t border-[#D5D5D5] pt-2 text-[13px] text-[#525252]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-black">
                    {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#2E7D32]">
                    <span>Discount</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#D5D5D5] pt-1.5 text-[15px] font-bold text-black sm:text-[17px]">
                  <span>Total Amount</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {!isCustomerLoggedIn() ? (
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("redirect_after_login", window.location.pathname);
                      }
                      onClose();
                      router.push(
                        `/login?redirect=${encodeURIComponent(
                          typeof window !== "undefined" ? window.location.pathname : "/"
                        )}`
                      );
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
                  onClick={handleConfirmOrder}
                  disabled={createOrder.isPending || !selectedAddressId}
                  className={cn(
                    BRAND,
                    "mt-4 h-[48px] w-full rounded-[8px] text-[16px] font-semibold uppercase text-white transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55244F]/50 focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "sm:h-[52px] 2xl:mt-5 2xl:h-[60px] 2xl:text-[22px]"
                  )}
                >
                  {createOrder.isPending ? "Placing Order…" : "Confirm Order"}
                </button>
              )}
            </div>
          </>
        )}

        {/* Order Note Panel */}
        {panel === "note" && (
          <ActionPanel title="Order Special Instructions" onClose={() => setPanel(null)}>
            <textarea
              aria-label="Order note"
              placeholder="e.g. Please deliver between 9 AM and 5 PM."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={cn(fieldClass, "h-[96px] resize-none py-3 sm:h-[110px] 2xl:h-[130px]")}
            />
            <ApplyButton onClick={() => setPanel(null)}>
              Save Note
            </ApplyButton>
          </ActionPanel>
        )}

        {/* Shipping Address Panel */}
        {panel === "shipping" && (
          <ShippingPanel
            onClose={() => setPanel(null)}
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
          />
        )}

        {/* Payment Method Panel */}
        {panel === "payment" && (
          <PaymentPanel
            onClose={() => setPanel(null)}
            selectedMethod={paymentMethod}
            onSelect={(m) => {
              setPaymentMethod(m);
              setPanel(null);
            }}
          />
        )}

        {/* Discount Coupon Panel */}
        {panel === "discount" && (
          <ActionPanel title="Discount Code" onClose={() => setPanel(null)}>
            <input
              type="text"
              aria-label="Discount code"
              placeholder="e.g. SUMMER50"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className={cn(fieldClass, inputH)}
            />
            <ApplyButton
              onClick={() => {
                setAppliedCoupon(couponCode.trim());
                setPanel(null);
              }}
            >
              Apply Discount
            </ApplyButton>
          </ActionPanel>
        )}
      </div>
    </div>
  );
}
