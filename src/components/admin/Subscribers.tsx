"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Search, Users, Trash2, AlertTriangle } from "lucide-react";
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

export interface Subscriber {
  _id: string;
  email: string;
  status: "active" | "unsubscribed" | string;
  token: string;
  source: string;
  subscribedAt: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SubscribersResponse {
  subscribers: Subscriber[];
  pagination: PaginationMeta;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

const fetchSubscribers = async (): Promise<SubscribersResponse> => {
  const { data } = await api.get<ApiResponse<SubscribersResponse>>(
    "/newsletter/admin/subscribers"
  );
  return data.data;
};

const deleteSubscriber = async (id: string) => {
  const { data } = await api.delete<ApiResponse<null>>(
    `/newsletter/admin/subscribers/${id}`
  );
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

const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status.toLowerCase() === "active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-gray-200 text-gray-600"
      }`}
    >
      {status}
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
        {Array.from({ length: 6 }).map((__, j) => (
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
  subscriber,
  onClose,
}: {
  subscriber: Subscriber | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (id: string) => deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletterSubscribers"] });
      onClose();
    },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={!!subscriber} onOpenChange={(v) => !v && close()}>
      <DialogContent
        aria-describedby={undefined}
        className={`${dialogClass} max-w-[440px]`}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold text-black">
            <AlertTriangle className="size-5 text-red-600" />
            Delete Subscriber
          </DialogTitle>
        </DialogHeader>

        <p className="mt-3 text-[13px] leading-relaxed text-gray-700">
          Are you sure you want to delete the subscriber{" "}
          <span className="font-semibold text-black">
            &quot;{subscriber?.email}&quot;
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
            <Button type="button" variant="outline" onClick={close} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isPending}
              onClick={() => subscriber && mutate(subscriber._id)}
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
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

const HEADERS = [
  "Email",
  "Status",
  "Source",
  "Subscribed Date",
  "Created Date",
  "Actions",
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function NewsletterSubscribers() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // State for delete dialog
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["newsletterSubscribers"],
    queryFn: fetchSubscribers,
    staleTime: 60 * 1000,
  });

  const subscribers = data?.subscribers ?? [];

  // Local filtering (by search & status)
  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      const matchesSearch =
        !search.trim() ||
        s.email.toLowerCase().includes(search.toLowerCase().trim());
      const matchesStatus =
        statusFilter === "all" || s.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, search, statusFilter]);

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

  const closeDelete = () => setSubscriberToDelete(null);

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-red-600">
        {getErrorMessage(error, "Failed to load subscribers")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header: Title + Stats */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
            <Users className="size-5" />
            Newsletter Subscribers
          </h2>
          <p className="text-[13px] text-gray-500">
            Manage your newsletter audience and subscriptions.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] shadow-sm ring-1 ring-gray-200">
          <Mail className="size-4 text-[#6E2D6B]" />
          <span className="font-medium">Total:</span>
          <span>{data?.pagination?.total ?? 0}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email..."
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
            className="rounded-md border border-[#D5D5D5] bg-white px-3 py-2 text-[13px] outline-none focus:border-black"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[900px]">
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
                  {subscribers.length === 0
                    ? "No subscribers found"
                    : "No subscribers match your filters"}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="max-w-[280px] truncate font-medium" title={s.email}>
                    {s.email}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {s.source || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-600">
                    {formatDate(s.subscribedAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-600">
                    {formatDate(s.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Button
                        type="button"
                        size="icon"
                        aria-label="Delete subscriber"
                        title="Delete"
                        onClick={() => setSubscriberToDelete(s)}
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

      {/* Delete Confirmation Dialog */}
      <DeleteDialog subscriber={subscriberToDelete} onClose={closeDelete} />
    </div>
  );
}