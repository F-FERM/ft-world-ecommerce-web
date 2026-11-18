"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Search, Eye, Trash2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import api from "@/src/lib/axios";

/* -------------------------------------------------------------------------- */
/*                                TYPES + API                                 */
/* -------------------------------------------------------------------------- */

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  street: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface StatusHistoryEntry {
  status: string;
  changedAt: string;
  note?: string;
}

export interface Order {
  _id: string;
  isDeleted: boolean;
  orderId: string;
  user: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  status: string;
  statusHistory: StatusHistoryEntry[];
  orderNote?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

const fetchOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<ApiResponse<Order[]>>("/orders");
  return data.data;
};

const deleteOrder = async (id: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/orders/${id}`);
  return data;
};

const getErrorMessage = (e: unknown, fallback = "Something went wrong") =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ??
  (e as Error)?.message ??
  fallback;

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const formatDate = (d: string) => dateFormatter.format(new Date(d));

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const formatCurrency = (n: number) => currencyFormatter.format(n ?? 0);

// Status -> color mapping. Unknown statuses fall back to neutral gray.
const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-gray-200 text-gray-700",
};

const StatusBadge = ({ status }: { status: string }) => {
  const key = status.toUpperCase();
  const styles = STATUS_STYLES[key] ?? "bg-gray-200 text-gray-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${styles}`}
    >
      {status.toLowerCase()}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                               TABLE SKELETON                               */
/* -------------------------------------------------------------------------- */

const TableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 8 }).map((__, j) => (
          <TableCell key={j}>
            <Skeleton className="h-4 w-[120px]" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

/* -------------------------------------------------------------------------- */
/*                              DELETE DIALOG                                 */
/* -------------------------------------------------------------------------- */

const dialogClass =
  "w-[calc(100%-2rem)] gap-0 rounded-[20px] border-0 bg-[#EFEFEF] p-4 font-poppins sm:p-6";

function DeleteDialog({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onClose();
    },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && close()}>
      <DialogContent
        aria-describedby={undefined}
        className={`${dialogClass} max-w-[440px]`}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold text-black">
            <AlertTriangle className="size-5 text-red-600" />
            Delete Order
          </DialogTitle>
        </DialogHeader>

        <p className="mt-3 text-[13px] leading-relaxed text-gray-700">
          Are you sure you want to delete the order{" "}
          <span className="font-semibold text-black">
            &quot;{order?.orderId}&quot;
          </span>
          ? This action cannot be undone.
        </p>

        {error && (
          <p className="mt-2 rounded-md bg-red-50 p-2 text-[11px] text-red-600">
            {getErrorMessage(error)}
          </p>
        )}

        <DialogFooter className="mt-5">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end sm:gap-2">
            <Button type="button" variant="outline" onClick={close} disabled={isPending} className="p-1">
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isPending}
              onClick={() => order && mutate(order._id)}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DETAILS DIALOG                                */
/* -------------------------------------------------------------------------- */

function OrderDetailsDialog({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className={`${dialogClass} max-h-[85vh] max-w-[560px] overflow-y-auto`}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold text-black">
            <ShoppingBag className="size-5" />
            Order {order?.orderId}
          </DialogTitle>
        </DialogHeader>

        {order && (
          <div className="mt-4 flex flex-col gap-4 text-[13px]">
            {/* Status + dates */}
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={order.status} />
              <span className="text-gray-500">
                Placed {formatDate(order.createdAt)}
              </span>
            </div>

            {/* Items */}
            <div>
              <p className="mb-1 font-semibold text-black">Items</p>
              <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.product}
                    className="flex items-center justify-between gap-2 rounded-md bg-white p-2 ring-1 ring-gray-200"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="whitespace-nowrap font-medium">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-md bg-white p-3 ring-1 ring-gray-200">
              <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
              <Row label="Tax" value={formatCurrency(order.tax)} />
              <Row label="Shipping" value={formatCurrency(order.shippingFee)} />
              <Row label="Discount" value={`- ${formatCurrency(order.discount)}`} />
              <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 font-semibold text-black">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Shipping address */}
            <div>
              <p className="mb-1 font-semibold text-black">Shipping Address</p>
              <p className="text-gray-700">
                {order.shippingAddress.fullName} · {order.shippingAddress.phone}
              </p>
              <p className="text-gray-600">
                {[
                  order.shippingAddress.addressLine1,
                  order.shippingAddress.addressLine2,
                  order.shippingAddress.street,
                  order.shippingAddress.city,
                  order.shippingAddress.state,
                  order.shippingAddress.postalCode,
                  order.shippingAddress.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>

            {/* Payment + note */}
            <div className="flex flex-col gap-1">
              <Row label="Payment Method" value={order.paymentMethod} />
              {order.orderNote && (
                <Row label="Order Note" value={order.orderNote} />
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-5">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3">
    <span className="text-gray-500">{label}</span>
    <span className="text-right text-gray-800">{value}</span>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

const HEADERS = [
  "Order ID",
  "Customer",
  "Items",
  "Total",
  "Payment",
  "Status",
  "Placed On",
  "Actions",
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_OPTIONS = [
  "all",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
];

export default function OrdersList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderToView, setOrderToView] = useState<Order | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 60 * 1000,
  });

  const orders = data ?? [];

  // Local filtering (by search & status)
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderId.toLowerCase().includes(q) ||
        o.shippingAddress.fullName.toLowerCase().includes(q) ||
        o.shippingAddress.phone.toLowerCase().includes(q) ||
        o.items.some((it) => it.name.toLowerCase().includes(q));
      const matchesStatus =
        statusFilter === "all" || o.status.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // Local pagination
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const startItem = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalCount);

  const closeDelete = () => setOrderToDelete(null);
  const closeView = () => setOrderToView(null);

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-red-600">
        {getErrorMessage(error, "Failed to load orders")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header: Title + Stats */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
            <ShoppingBag className="size-5" />
            Orders
          </h2>
          <p className="text-[13px] text-gray-500">
            View and manage customer orders.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] shadow-sm ring-1 ring-gray-200">
          <ShoppingBag className="size-4 text-[#6E2D6B]" />
          <span className="font-medium">Total:</span>
          <span>{orders.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer, or item..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-[#D5D5D5] bg-white py-2 pl-9 pr-3 text-[13px] outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[13px] text-gray-600">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-[#D5D5D5] bg-white px-3 py-2 text-[13px] capitalize outline-none focus:border-black"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s === "all" ? "All" : s.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {HEADERS.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={HEADERS.length}
                  className="py-8 text-center text-sm"
                >
                  {orders.length === 0
                    ? "No orders found"
                    : "No orders match your filters"}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {o.orderId}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate font-medium" title={o.shippingAddress.fullName}>
                      {o.shippingAddress.fullName}
                    </p>
                    <p className="truncate text-[11px] text-gray-500" title={o.shippingAddress.phone}>
                      {o.shippingAddress.phone}
                    </p>
                  </TableCell>
                  <TableCell
                    className="whitespace-nowrap text-gray-600"
                    title={o.items.map((i) => i.name).join(", ")}
                  >
                    {o.items.length} item{o.items.length === 1 ? "" : "s"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatCurrency(o.totalAmount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-600">
                    {o.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-600">
                    {formatDate(o.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label="View order"
                        title="View"
                        onClick={() => setOrderToView(o)}
                      >
                        <Eye className="size-4 text-gray-600" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        aria-label="Delete order"
                        title="Delete"
                        onClick={() => setOrderToDelete(o)}
                      >
                        <Trash2 className="size-4 text-white-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 text-[13px] sm:flex-row">
        <p>
          Showing {startItem}–{endItem} of {totalCount}
        </p>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            Rows per page
            <select
              className="rounded-md border border-[#D5D5D5] bg-white px-2 py-1"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-[#D5D5D5] bg-white px-3 py-1 text-[12px] disabled:opacity-50"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
            >
              Prev
            </button>
            <span>
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              className="rounded-md border border-[#D5D5D5] bg-white px-3 py-1 text-[12px] disabled:opacity-50"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <OrderDetailsDialog order={orderToView} onClose={closeView} />
      <DeleteDialog order={orderToDelete} onClose={closeDelete} />
    </div>
  );
}