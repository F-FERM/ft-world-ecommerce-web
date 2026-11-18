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

export interface ParentCategory {
  _id: string;
  name: string;
  imageUrl?: string;
  slug?: string;
}

export interface Category {
  _id: string;
  isDeleted: boolean;
  name: string;
  description?: string;
  isActive: boolean;
  imageUrl?: string;
  slug: string;
  // null / missing = top-level. API may return an ID string or a populated object.
  parentCategory?: string | ParentCategory | null;
  createdAt: string;
  updatedAt: string;
}

/** Shape sent to the API. Only name + slug are required. */
export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  imageUrl?: string;
  parentCategory?: string | null;
}

/** Shape used by the form state ("" = not set). */
interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  imageUrl: string;
  parentCategory: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

const CategoryApi = {
  getAll: () =>
    api.get<ApiResponse<Category[]>>("/categories").then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<Category>>(`/categories/${id}`).then((r) => r.data),
  create: (payload: CategoryPayload) =>
    api.post<ApiResponse<Category>>("/categories", payload).then((r) => r.data),
  update: (id: string, payload: CategoryPayload) =>
    api
      .patch<ApiResponse<Category>>(`/categories/${id}`, payload)
      .then((r) => r.data),
  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/categories/${id}`).then((r) => r.data),
};

const getErrorMessage = (e: unknown, fallback = "Something went wrong") =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ??
  (e as Error)?.message ??
  fallback;

/** Normalises parentCategory (null | id | populated object) to an id or "". */
const getParentId = (p: Category["parentCategory"]): string =>
  !p ? "" : typeof p === "string" ? p : p._id;

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const QUERY_KEY = ["categoryList"] as const;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const EMPTY: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
  imageUrl: "",
  parentCategory: "",
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

// Utility to generate slug from name
const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

/** Build the request body. Optional fields are omitted when empty. */
function toPayload(v: CategoryFormValues, isEdit: boolean): CategoryPayload {
  const payload: CategoryPayload = {
    name: v.name.trim(),
    slug: v.slug.trim(),
    description: v.description.trim(),
    isActive: v.isActive,
  };

  // imageUrl: omit on create when empty; on edit send "" so it can be cleared
  if (v.imageUrl) payload.imageUrl = v.imageUrl;
  else if (isEdit) payload.imageUrl = "";

  // parentCategory: omit on create when empty; on edit send null so it can be cleared
  if (v.parentCategory) payload.parentCategory = v.parentCategory;
  else if (isEdit) payload.parentCategory = null;

  return payload;
}

/** All descendant ids of a category (used to prevent circular parents). */
function getDescendantIds(rootId: string, all: Category[]): Set<string> {
  const result = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop()!;
    for (const c of all) {
      if (getParentId(c.parentCategory) === current && !result.has(c._id)) {
        result.add(c._id);
        stack.push(c._id);
      }
    }
  }
  return result;
}

/* -------------------------------------------------------------------------- */
/*                                 VALIDATION                                 */
/* -------------------------------------------------------------------------- */

type FormErrors = Partial<Record<keyof CategoryFormValues, string>>;

function validate(v: CategoryFormValues): FormErrors {
  const errors: FormErrors = {};
  const name = v.name.trim();

  if (name.length < 2) errors.name = "Name must be at least 2 characters";
  else if (name.length > 100)
    errors.name = "Name must be at most 100 characters";

  if (!v.slug.trim()) errors.slug = "Slug is required";

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
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return onError("Please select an image file");
    if (file.size > MAX_IMAGE_SIZE) return onError("Image must be under 5MB");

    setUploading(true);
    onUploadingChange(true);
    try {
      const res = await fileUpload(file);
      const url =
        res?.url ??
        (res as unknown as { data?: { url?: string } })?.data?.url;
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
    <Field label="Category Image (Optional)" error={error}>
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
            alt="Category preview"
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
        {Array.from({ length: 7 }).map((__, j) => (
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

function CategoryForm({
  initial,
  categoryId,
  availableParents,
  onClose,
}: {
  initial: CategoryFormValues;
  categoryId?: string | null;
  availableParents: Category[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!categoryId;

  const [values, setValues] = useState<CategoryFormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploading, setUploading] = useState(false);

  const setField = useCallback(
    <K extends keyof CategoryFormValues>(
      key: K,
      value: CategoryFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  // Auto-generate slug when name changes (only if creating, or slug still matches the old name)
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setField("name", newName);
    if (!isEdit || values.slug === generateSlug(values.name)) {
      setField("slug", generateSlug(newName));
    }
  };

  const { mutate, isPending, error: apiError } = useMutation({
    mutationFn: (payload: CategoryPayload) =>
      isEdit
        ? CategoryApi.update(String(categoryId), payload)
        : CategoryApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      if (categoryId)
        queryClient.invalidateQueries({
          queryKey: ["categoryById", categoryId],
        });
      onClose();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    mutate(toPayload(values, isEdit));
  };

  // A category can't be its own parent, nor a child of its own descendants
  const parentOptions = useMemo(() => {
    if (!categoryId) return availableParents;
    const blocked = getDescendantIds(categoryId, availableParents);
    blocked.add(categoryId);
    return availableParents.filter((c) => !blocked.has(c._id));
  }, [availableParents, categoryId]);

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <Field label="Category Name" required error={errors.name} htmlFor="name">
        <input
          id="name"
          className={inputClass}
          placeholder="eg. Toner Bottle"
          value={values.name}
          onChange={handleNameChange}
        />
      </Field>

      <Field label="Slug" required error={errors.slug} htmlFor="slug">
        <input
          id="slug"
          className={inputClass}
          placeholder="eg. toner-bottle"
          value={values.slug}
          onChange={(e) => setField("slug", e.target.value)}
        />
      </Field>

      <ImageUploader
        value={values.imageUrl}
        error={errors.imageUrl}
        onChange={(url) => setField("imageUrl", url)}
        onError={(m) => setErrors((p) => ({ ...p, imageUrl: m }))}
        onUploadingChange={setUploading}
      />

      <Field label="Description (Optional)" htmlFor="description">
        <textarea
          id="description"
          rows={3}
          className={inputClass}
          placeholder="Enter category description"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
        />
      </Field>

      <Field label="Parent Category (Optional)" htmlFor="parentCategory">
        <select
          id="parentCategory"
          className={inputClass}
          value={values.parentCategory}
          onChange={(e) => setField("parentCategory", e.target.value)}
        >
          <option value="">None (top-level category)</option>
          {parentOptions.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
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

      {apiError && (
        <p className="text-[11px] text-red-600">{getErrorMessage(apiError)}</p>
      )}

      <DialogFooter className="mt-2">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end sm:gap-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || uploading}>
            {isPending
              ? "Saving..."
              : isEdit
                ? "Update Category"
                : "Save Category"}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*                              ADD / EDIT DIALOG                             */
/* -------------------------------------------------------------------------- */

function CategoryDialog({
  open,
  categoryId,
  availableParents,
  onClose,
}: {
  open: boolean;
  categoryId: string | null;
  availableParents: Category[];
  onClose: () => void;
}) {
  const isEdit = !!categoryId;

  const { data, isLoading } = useQuery({
    queryKey: ["categoryById", categoryId],
    queryFn: () => CategoryApi.getById(String(categoryId)),
    enabled: open && isEdit,
  });

  const initial = useMemo<CategoryFormValues>(() => {
    const c = data?.data;
    if (!c) return EMPTY;

    return {
      name: c.name ?? "",
      slug: c.slug ?? "",
      description: c.description ?? "",
      isActive: c.isActive,
      imageUrl: c.imageUrl ?? "",
      parentCategory: getParentId(c.parentCategory),
    };
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className={`${dialogClass} max-h-[90dvh] max-w-[560px] overflow-y-auto`}
      >
        <DialogHeader className="border-b border-[#D5D5D5] pb-3 text-left">
          <DialogTitle className="text-[14px] font-semibold text-black">
            {isEdit ? "Edit Category" : "Add New Category"}
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
            <CategoryForm
              key={categoryId ?? "new"}
              initial={initial}
              categoryId={categoryId}
              availableParents={availableParents}
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
  category,
  onClose,
}: {
  category: Category | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (id: string) => CategoryApi.remove(id),
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
    <Dialog open={!!category} onOpenChange={(v) => !v && close()}>
      <DialogContent
        aria-describedby={undefined}
        className={`${dialogClass} max-w-[420px]`}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-[14px] font-semibold text-black">
            Delete Category
          </DialogTitle>
        </DialogHeader>

        <p className="mt-2 text-[13px]">
          Are you sure you want to delete category &quot;{category?.name}&quot;?
        </p>
        {error && (
          <p className="mt-1 text-[11px] text-red-600">
            {getErrorMessage(error)}
          </p>
        )}

        <DialogFooter className="mt-4">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end sm:gap-2">
            <Button type="button" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => category && mutate(category._id)}
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

const CategoryRow = memo(function CategoryRow({
  category: c,
  parentName,
  onEdit,
  onDelete,
}: {
  category: Category;
  parentName: string;
  onEdit: (id: string) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        {c.imageUrl ? (
          <img
            src={c.imageUrl}
            alt={c.name}
            loading="lazy"
            className="h-10 w-16 rounded border border-[#D5D5D5] object-cover"
          />
        ) : (
          <div className="flex h-10 w-16 items-center justify-center rounded border border-[#D5D5D5] bg-gray-100 text-xs text-gray-400">
            No img
          </div>
        )}
      </TableCell>
      <TableCell className="max-w-[150px] truncate font-medium" title={c.name}>
        {c.name}
      </TableCell>
      <TableCell
        className="max-w-[150px] truncate text-gray-500"
        title={c.slug}
      >
        {c.slug}
      </TableCell>
      <TableCell className="max-w-[200px] truncate" title={c.description}>
        {c.description || "-"}
      </TableCell>
      <TableCell className="max-w-[200px] truncate" title={parentName}>
        {parentName || "-"}
      </TableCell>
      <TableCell>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            c.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {c.isActive ? "Active" : "Inactive"}
        </span>
      </TableCell>
      <TableCell>{formatDate(c.createdAt)}</TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            size="icon"
            aria-label="Edit"
            title="Edit"
            onClick={() => onEdit(c._id)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            aria-label="Delete"
            title="Delete"
            onClick={() => onDelete(c)}
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

export default function CategorySettings() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dialog, setDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: CategoryApi.getAll,
  });

  const categories = data?.data;
  const totalCount = categories?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  // id -> name lookup so we can show the parent's name even when the API returns only an ID
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    (categories ?? []).forEach((c) => map.set(c._id, c.name));
    return map;
  }, [categories]);

  const getParentName = useCallback(
    (c: Category) => {
      const p = c.parentCategory;
      if (!p) return "";
      if (typeof p !== "string") return p.name;
      return nameById.get(p) ?? "";
    },
    [nameById],
  );

  const paged = useMemo(
    () =>
      (categories ?? []).slice((safePage - 1) * pageSize, safePage * pageSize),
    [categories, safePage, pageSize],
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
  const closeDelete = useCallback(() => setCategoryToDelete(null), []);

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-red-600">
        {getErrorMessage(error, "Failed to load categories")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full justify-end">
        <Button type="button" onClick={openAdd}>
          <Plus className="mr-2 size-4" />
          Add Category
        </Button>
      </div>

      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {[
                "Image",
                "Name",
                "Slug",
                "Description",
                "Parent Category",
                "Status",
                "Created Date",
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
                <TableCell colSpan={8} className="py-8 text-center text-sm">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              paged.map((c) => (
                <CategoryRow
                  key={c._id}
                  category={c}
                  parentName={getParentName(c)}
                  onEdit={openEdit}
                  onDelete={setCategoryToDelete}
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

      <CategoryDialog
        open={dialog.open}
        categoryId={dialog.id}
        availableParents={categories ?? []}
        onClose={closeDialog}
      />
      <DeleteDialog category={categoryToDelete} onClose={closeDelete} />
    </div>
  );
}