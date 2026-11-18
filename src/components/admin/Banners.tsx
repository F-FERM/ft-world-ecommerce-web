"use client";


import { fileUpload } from "@/src/app/api/upload";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import api from "@/src/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

/* -------------------------------------------------------------------------- */
/*                                TYPES + API                                 */
/* -------------------------------------------------------------------------- */

export interface Banner {
  _id: string;
  isDeleted: boolean;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  buttonText: string;
  buttonUrl: string;
  offerText: string;
  createdAt: string;
  updatedAt: string;
}

export type BannerPayload = Omit<
  Banner,
  "_id" | "isDeleted" | "createdAt" | "updatedAt"
>;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

const BannerApi = {
  getAll: () =>
    api.get<ApiResponse<Banner[]>>("/banner").then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<Banner>>(`/banner/${id}`).then((r) => r.data),
  create: (payload: BannerPayload) =>
    api.post<ApiResponse<Banner>>("/banner", payload).then((r) => r.data),
  update: (id: string, payload: BannerPayload) =>
    api
      .patch<ApiResponse<Banner>>(`/banner/${id}`, payload)
      .then((r) => r.data),
  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/banner/${id}`).then((r) => r.data),
};

// Works for axios errors and plain errors
const getErrorMessage = (e: unknown, fallback = "Something went wrong") =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ??
  (e as Error)?.message ??
  fallback;

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const QUERY_KEY = ["bannerList"] as const;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const EMPTY: BannerPayload = {
  title: "",
  description: "",
  imageUrl: "",
  isActive: true,
  buttonText: "",
  buttonUrl: "",
  offerText: "",
};

const inputClass =
  "w-full rounded-md border border-[#D5D5D5] bg-white px-3 py-2 text-[13px] outline-none focus:border-black";
const smallBtnClass =
  "rounded-md border border-[#D5D5D5] bg-white px-3 py-1 text-[12px] disabled:opacity-50";
const dialogClass =
  "w-[calc(100%-2rem)] gap-0 rounded-[20px] border-0 bg-[#EFEFEF] p-4 font-poppins sm:p-6";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const formatDate = (d: string) => dateFormatter.format(new Date(d));

/* -------------------------------------------------------------------------- */
/*                                 VALIDATION                                 */
/* -------------------------------------------------------------------------- */

type FormErrors = Partial<Record<keyof BannerPayload, string>>;

function validate(v: BannerPayload): FormErrors {
  const errors: FormErrors = {};
  const title = v.title.trim();

  if (title.length < 2) errors.title = "Title must be at least 2 characters";
  else if (title.length > 100)
    errors.title = "Title must be at most 100 characters";

  if (!v.imageUrl) errors.imageUrl = "Please upload a banner image";

  if (v.buttonUrl.trim()) {
    try {
      new URL(v.buttonUrl.trim());
    } catch {
      errors.buttonUrl = "Enter a valid URL (https://...)";
    }
  }
  return errors;
}

/* -------------------------------------------------------------------------- */
/*                               SMALL UI PIECES                              */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  required,
  error,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-[12px] font-medium text-black"
      >
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

function ImageUploader({
  value,
  error,
  onChange,
  onError,
  onUploadingChange,
}: {
  value: string;
  error?: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return onError("Please select an image file");
    if (file.size > MAX_IMAGE_SIZE) return onError("Image must be under 5MB");

    setUploading(true);
    onUploadingChange(true);
    try {
      const res = await fileUpload(file);
      // supports { url } and { data: { url } }
      const url = res?.url ?? (res as unknown as { data?: { url?: string } })?.data?.url;
      if (!url) throw new Error("Upload failed: no URL returned");
      onChange(url);
    } catch (err) {
      onError(getErrorMessage(err, "Image upload failed"));
    } finally {
      setUploading(false);
      onUploadingChange(false);
    }
  };

  const pick = () => inputRef.current?.click();

  return (
    <Field label="Banner Image" required error={error}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {value ? (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt="Banner preview"
            className="h-20 w-32 rounded-md border border-[#D5D5D5] bg-white object-cover"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={pick}
              className={smallBtnClass}
            >
              {uploading ? "Uploading..." : "Change"}
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => onChange("")}
              className={`${smallBtnClass} border-red-300 text-red-600`}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={pick}
          className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-[#9a9a9a] bg-white text-[13px] text-gray-600 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Click to upload image"}
        </button>
      )}
    </Field>
  );
}

const TableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 8 }).map((__, j) => (
          <TableCell key={j}>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
        ))}
        <TableCell>
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="size-8 rounded" />
            <Skeleton className="size-8 rounded" />
          </div>
        </TableCell>
      </TableRow>
    ))}
  </>
);

/* -------------------------------------------------------------------------- */
/*                                 FORM (BODY)                                */
/* -------------------------------------------------------------------------- */
/* Mounted only while the dialog is open, so state resets automatically and   */
/* initial values need no useEffect.                                          */

function BannerForm({
  initial,
  bannerId,
  onClose,
}: {
  initial: BannerPayload;
  bannerId?: string | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!bannerId;

  const [values, setValues] = useState<BannerPayload>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploading, setUploading] = useState(false);

  const setField = useCallback(
    <K extends keyof BannerPayload>(key: K, value: BannerPayload[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const { mutate, isPending, error: apiError } = useMutation({
    mutationFn: (payload: BannerPayload) =>
      isEdit
        ? BannerApi.update(String(bannerId), payload)
        : BannerApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      if (bannerId)
        queryClient.invalidateQueries({ queryKey: ["bannerById", bannerId] });
      onClose();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    mutate({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      buttonText: values.buttonText.trim(),
      buttonUrl: values.buttonUrl.trim(),
      offerText: values.offerText.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <Field label="Title" required error={errors.title} htmlFor="title">
        <input
          id="title"
          className={inputClass}
          placeholder="eg. Bring every print to life."
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
        />
      </Field>

      <ImageUploader
        value={values.imageUrl}
        error={errors.imageUrl}
        onChange={(url) => setField("imageUrl", url)}
        onError={(m) => setErrors((p) => ({ ...p, imageUrl: m }))}
        onUploadingChange={setUploading}
      />

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          rows={3}
          className={inputClass}
          placeholder="Enter banner description"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Button Text" htmlFor="buttonText">
          <input
            id="buttonText"
            className={inputClass}
            placeholder="eg. Shop Now"
            value={values.buttonText}
            onChange={(e) => setField("buttonText", e.target.value)}
          />
        </Field>

        <Field label="Button URL" error={errors.buttonUrl} htmlFor="buttonUrl">
          <input
            id="buttonUrl"
            className={inputClass}
            placeholder="https://example.com/shop"
            value={values.buttonUrl}
            onChange={(e) => setField("buttonUrl", e.target.value)}
          />
        </Field>

        <Field label="Offer Text" htmlFor="offerText">
          <input
            id="offerText"
            className={inputClass}
            placeholder="eg. ₹399"
            value={values.offerText}
            onChange={(e) => setField("offerText", e.target.value)}
          />
        </Field>

        <Field label="Status" htmlFor="isActive">
          <select
            id="isActive"
            className={inputClass}
            value={String(values.isActive)}
            onChange={(e) => setField("isActive", e.target.value === "true")}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </Field>
      </div>

      {apiError && (
        <p className="text-[11px] text-red-600">{getErrorMessage(apiError)}</p>
      )}

      <DialogFooter className="mt-2">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end sm:gap-2">
          <Button type="button"  onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit"  disabled={isPending || uploading}>
            {isPending
              ? "Saving..."
              : isEdit
                ? "Update Banner"
                : "Save Banner"}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*                              ADD / EDIT DIALOG                             */
/* -------------------------------------------------------------------------- */

function BannerDialog({
  open,
  bannerId,
  onClose,
}: {
  open: boolean;
  bannerId: string | null;
  onClose: () => void;
}) {
  const isEdit = !!bannerId;

  const { data, isLoading } = useQuery({
    queryKey: ["bannerById", bannerId],
    queryFn: () => BannerApi.getById(String(bannerId)),
    enabled: open && isEdit,
  });

  const initial = useMemo<BannerPayload>(() => {
    const b = data?.data;
    return b
      ? {
          title: b.title ?? "",
          description: b.description ?? "",
          imageUrl: b.imageUrl ?? "",
          isActive: b.isActive,
          buttonText: b.buttonText ?? "",
          buttonUrl: b.buttonUrl ?? "",
          offerText: b.offerText ?? "",
        }
      : EMPTY;
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className={`${dialogClass} max-h-[90dvh] max-w-[560px] overflow-y-auto`}
      >
        <DialogHeader className="border-b border-[#D5D5D5] pb-3 text-left">
          <DialogTitle className="text-[14px] font-semibold text-black">
            {isEdit ? "Edit Banner" : "Add New Banner"}
          </DialogTitle>
        </DialogHeader>

        {isEdit && isLoading ? (
          <div className="flex flex-col gap-3 py-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          open && (
            <BannerForm
              key={bannerId ?? "new"}
              initial={initial}
              bannerId={bannerId}
              onClose={onClose}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DELETE CONFIRMATION                           */
/* -------------------------------------------------------------------------- */

function DeleteDialog({
  banner,
  onClose,
}: {
  banner: Banner | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (id: string) => BannerApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      onClose();
    },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={!!banner} onOpenChange={(v) => !v && close()}>
      <DialogContent
        aria-describedby={undefined}
        className={`${dialogClass} max-w-[420px]`}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-[14px] font-semibold text-black">
            Delete Banner
          </DialogTitle>
        </DialogHeader>

        <p className="mt-2 text-[13px]">
          Are you sure you want to delete banner &quot;{banner?.title}&quot;?
        </p>
        {error && (
          <p className="mt-1 text-[11px] text-red-600">
            {getErrorMessage(error)}
          </p>
        )}

        <DialogFooter className="mt-4">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end sm:gap-2">
            <Button type="button"  onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
             
              disabled={isPending}
              onClick={() => banner && mutate(banner._id)}
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
/*                                  TABLE ROW                                 */
/* -------------------------------------------------------------------------- */

const BannerRow = memo(function BannerRow({
  banner: b,
  onEdit,
  onDelete,
}: {
  banner: Banner;
  onEdit: (id: string) => void;
  onDelete: (banner: Banner) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <img
          src={b.imageUrl}
          alt={b.title}
          loading="lazy"
          className="h-10 w-16 rounded border border-[#D5D5D5] object-cover"
        />
      </TableCell>
      <TableCell className="max-w-[180px] truncate" title={b.title}>
        {b.title}
      </TableCell>
      <TableCell className="max-w-[220px] truncate" title={b.description}>
        {b.description || "-"}
      </TableCell>
      <TableCell>{b.offerText || "-"}</TableCell>
      <TableCell>
        {b.buttonText ? (
          <a
            href={b.buttonUrl}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {b.buttonText}
          </a>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            b.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {b.isActive ? "Active" : "Inactive"}
        </span>
      </TableCell>
      <TableCell>{formatDate(b.createdAt)}</TableCell>
      <TableCell>{formatDate(b.updatedAt)}</TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
          
            size="icon"
            aria-label="Edit"
            title="Edit"
            onClick={() => onEdit(b._id)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
          
            aria-label="Delete"
            title="Delete"
            onClick={() => onDelete(b)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function BannerSettings() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dialog, setDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: BannerApi.getAll,
  });

  // client-side pagination (API returns the full list)
  const banners = data?.data;
  const totalCount = banners?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(
    () => (banners ?? []).slice((safePage - 1) * pageSize, safePage * pageSize),
    [banners, safePage, pageSize],
  );

  const startItem = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalCount);

  const openAdd = useCallback(() => setDialog({ open: true, id: null }), []);
  const openEdit = useCallback(
    (id: string) => setDialog({ open: true, id }),
    [],
  );
  const closeDialog = useCallback(
    () => setDialog((d) => ({ ...d, open: false })),
    [],
  );
  const closeDelete = useCallback(() => setBannerToDelete(null), []);

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-red-600">
        {getErrorMessage(error, "Failed to load banners")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full justify-end">
        <Button type="button"  onClick={openAdd}>
          <Plus />
          Add Banner
        </Button>
      </div>

      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {[
                "Image",
                "Title",
                "Description",
                "Offer",
                "Button",
                "Status",
                "Created Date",
                "Updated Date",
                "Actions",
              ].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-sm">
                  No banners found
                </TableCell>
              </TableRow>
            ) : (
              paged.map((b) => (
                <BannerRow
                  key={b._id}
                  banner={b}
                  onEdit={openEdit}
                  onDelete={setBannerToDelete}
                />
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
              className={smallBtnClass}
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
              className={smallBtnClass}
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <BannerDialog
        open={dialog.open}
        bannerId={dialog.id}
        onClose={closeDialog}
      />
      <DeleteDialog banner={bannerToDelete} onClose={closeDelete} />
    </div>
  );
}