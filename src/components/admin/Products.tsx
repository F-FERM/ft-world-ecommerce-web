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
import { Pencil, Plus, Trash2, X } from "lucide-react";
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

interface CategoryRef {
  _id: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  accessoryCategories: (string | { _id: string })[];
}

interface Attribute {
  name: string;
  values: string[];
}

export interface Product {
  _id: string;
  isDeleted: boolean;
  name: string;
  slug: string;
  compatibleDescription: string;
  compatibleValues: string;
  category: CategoryRef | string;
  subcategory?: CategoryRef | string | null;
  images: string[];
  sellingPrice: number;
  originalPrice: number;
  stock: number;
  attributes: Attribute[];
  highlights: string[];
  shipsIn: string;
  returnPolicy: string;
  supportInfo: string;
  warranty: string;
  averageRating: number;
  totalReviews: number;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  slug: string;
  compatibleDescription: string;
  compatibleValues: string;
  category: string;
  subcategory?: string;
  images: string[];
  sellingPrice: number;
  originalPrice: number;
  stock: number;
  attributes: Attribute[];
  highlights: string[];
  shipsIn: string;
  supportInfo: string;
  warranty: string;
  returnPolicy: string;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

const ProductApi = {
  getAll: () =>
    api.get<ApiResponse<Product[]>>("/products").then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/${id}`).then((r) => r.data),
  create: (payload: ProductPayload) =>
    api.post<ApiResponse<Product>>("/products", payload).then((r) => r.data),
  update: (id: string, payload: ProductPayload) =>
    api
      .patch<ApiResponse<Product>>(`/products/${id}`, payload)
      .then((r) => r.data),
  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/products/${id}`).then((r) => r.data),
};

const fetchCategories = () =>
  api
    .get<ApiResponse<CategoryRef[]>>("/categories")
    .then((r) => r.data?.data ?? []);

const getErrorMessage = (e: unknown, fallback = "Something went wrong") =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ??
  (e as Error)?.message ??
  fallback;

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const QUERY_KEY = ["productList"] as const;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const inputClass =
  "w-full min-w-0 rounded-md border border-[#D5D5D5] bg-white px-3 py-2 text-[13px] outline-none focus:border-black disabled:opacity-60";
const smallBtnClass =
  "rounded-md border border-[#D5D5D5] bg-white px-3 py-1 text-[12px] disabled:opacity-50";

// NOTE: shadcn's DialogContent ships with `sm:max-w-sm`. A plain `max-w-[..]`
// does NOT override it on screens >= sm, so the width must be set with the
// `sm:` prefix on each dialog (see ProductDialog / DeleteDialog).
const dialogClass =
  "w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] gap-0 rounded-[20px] border-0 bg-[#EFEFEF] p-4 font-poppins sm:p-6";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const formatDate = (d: string) => dateFormatter.format(new Date(d));

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const formatPrice = (n: number) => priceFormatter.format(n);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const idOf = (v: { _id: string } | string | null | undefined) =>
  !v ? "" : typeof v === "string" ? v : v._id;

const nameOf = (v: { name: string } | string | null | undefined) =>
  !v || typeof v === "string" ? "" : v.name;

/* -------------------------------------------------------------------------- */
/*                             FORM MODEL + MAPPERS                           */
/* -------------------------------------------------------------------------- */

interface FormValues {
  name: string;
  slug: string;
  compatibleDescription: string;
  compatibleValues: string;
  category: string;
  subcategory: string;
  images: string[];
  sellingPrice: string;
  originalPrice: string;
  stock: string;
  attributes: { name: string; values: string }[];
  highlights: string;
  shipsIn: string;
  supportInfo: string;
  warranty: string;
  returnPolicy: string;
  averageRating: string;
  totalReviews: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
}

const EMPTY: FormValues = {
  name: "",
  slug: "",
  compatibleDescription: "",
  compatibleValues: "",
  category: "",
  subcategory: "",
  images: [],
  sellingPrice: "",
  originalPrice: "",
  stock: "0",
  attributes: [],
  highlights: "",
  shipsIn: "",
  supportInfo: "",
  warranty: "",
  returnPolicy: "",
  averageRating: "0",
  totalReviews: "0",
  isActive: true,
  metaTitle: "",
  metaDescription: "",
};

const fromProduct = (p: Product): FormValues => ({
  name: p.name ?? "",
  slug: p.slug ?? "",
  compatibleDescription: p.compatibleDescription ?? "",
  compatibleValues: p.compatibleValues ?? "",
  category: idOf(p.category),
  subcategory: idOf(p.subcategory),
  images: p.images ?? [],
  sellingPrice: String(p.sellingPrice ?? ""),
  originalPrice: String(p.originalPrice ?? ""),
  stock: String(p.stock ?? 0),
  attributes: (p.attributes ?? []).map((a) => ({
    name: a.name,
    values: a.values.join(", "),
  })),
  highlights: (p.highlights ?? []).join("\n"),
  shipsIn: p.shipsIn ?? "",
  supportInfo: p.supportInfo ?? "",
  warranty: p.warranty ?? "",
  returnPolicy: p.returnPolicy ?? "",
  averageRating: String(p.averageRating ?? 0),
  totalReviews: String(p.totalReviews ?? 0),
  isActive: p.isActive,
  metaTitle: p.metaTitle ?? "",
  metaDescription: p.metaDescription ?? "",
});

const splitList = (s: string, sep: string | RegExp) =>
  s
    .split(sep)
    .map((x) => x.trim())
    .filter(Boolean);

const toPayload = (v: FormValues): ProductPayload => ({
  name: v.name.trim(),
  slug: v.slug.trim(),
  compatibleDescription: v.compatibleDescription.trim(),
  compatibleValues: v.compatibleValues.trim(),
  category: v.category,
  ...(v.subcategory ? { subcategory: v.subcategory } : {}),
  images: v.images,
  sellingPrice: Number(v.sellingPrice),
  originalPrice: Number(v.originalPrice),
  stock: Number(v.stock),
  attributes: v.attributes
    .filter((a) => a.name.trim())
    .map((a) => ({ name: a.name.trim(), values: splitList(a.values, ",") })),
  highlights: splitList(v.highlights, "\n"),
  shipsIn: v.shipsIn.trim(),
  supportInfo: v.supportInfo.trim(),
  warranty: v.warranty.trim(),
  returnPolicy: v.returnPolicy.trim(),
  averageRating: Number(v.averageRating),
  totalReviews: Number(v.totalReviews),
  isActive: v.isActive,
  metaTitle: v.metaTitle.trim(),
  metaDescription: v.metaDescription.trim(),
});

/* -------------------------------------------------------------------------- */
/*                                 VALIDATION                                 */
/* -------------------------------------------------------------------------- */

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  const name = v.name.trim();

  if (name.length < 2) e.name = "Name must be at least 2 characters";
  else if (name.length > 150) e.name = "Name must be at most 150 characters";

  if (!v.slug.trim()) e.slug = "Slug is required";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug.trim()))
    e.slug = "Use lowercase letters, numbers and hyphens only";

  if (!v.category) e.category = "Select a category";
  if (v.images.length === 0) e.images = "Upload at least one image";

  const selling = Number(v.sellingPrice);
  const original = Number(v.originalPrice);
  if (v.sellingPrice === "" || Number.isNaN(selling) || selling < 0)
    e.sellingPrice = "Enter a valid selling price";
  if (v.originalPrice === "" || Number.isNaN(original) || original < 0)
    e.originalPrice = "Enter a valid original price";
  else if (!e.sellingPrice && original < selling)
    e.originalPrice = "Can't be below selling price";

  const stock = Number(v.stock);
  if (v.stock === "" || !Number.isInteger(stock) || stock < 0)
    e.stock = "Enter a whole number (0 or more)";

  const rating = Number(v.averageRating);
  if (Number.isNaN(rating) || rating < 0 || rating > 5)
    e.averageRating = "Rating must be between 0 and 5";

  const reviews = Number(v.totalReviews);
  if (!Number.isInteger(reviews) || reviews < 0)
    e.totalReviews = "Enter a whole number (0 or more)";

  return e;
}

/* -------------------------------------------------------------------------- */
/*                               SMALL UI PIECES                              */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  required,
  error,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    // min-w-0 lets grid children shrink instead of overflowing on small screens
    <div className={`min-w-0 ${className ?? ""}`}>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-[12px] font-medium text-black"
      >
        {label} {required && <span className="text-red-600">*</span>}
        {hint && (
          <span className="ml-1 font-normal text-gray-500">({hint})</span>
        )}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="border-b border-[#D5D5D5] pb-1 text-[12px] font-semibold uppercase tracking-wide text-black">
    {children}
  </h3>
);

function ImagesUploader({
  images,
  error,
  onAdd,
  onRemove,
  onError,
  onUploadingChange,
}: {
  images: string[];
  error?: string;
  onAdd: (urls: string[]) => void;
  onRemove: (index: number) => void;
  onError: (message: string) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const slots = MAX_IMAGES - images.length;
    if (slots <= 0) return onError(`Maximum ${MAX_IMAGES} images allowed`);

    const valid = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_SIZE,
    );
    const toUpload = valid.slice(0, slots);
    const skipped = files.length - toUpload.length;

    setUploading(true);
    onUploadingChange(true);

    const results = await Promise.allSettled(
      toUpload.map(async (file) => {
        const res = await fileUpload(file);
        const url =
          res?.url ??
          (res as unknown as { data?: { url?: string } })?.data?.url;
        if (!url) throw new Error("No URL returned");
        return url;
      }),
    );

    const urls = results.flatMap((r) =>
      r.status === "fulfilled" ? [r.value] : [],
    );
    if (urls.length) onAdd(urls);

    const failed = toUpload.length - urls.length + skipped;
    if (failed > 0)
      onError(
        `${failed} file(s) skipped or failed (images only, max 5MB each, up to ${MAX_IMAGES} total)`,
      );

    setUploading(false);
    onUploadingChange(false);
  };

  return (
    <Field
      label="Product Images"
      required
      error={error}
      hint={`${images.length}/${MAX_IMAGES}, first image is the main one`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative size-20 overflow-hidden rounded-md border border-[#D5D5D5] bg-white sm:size-24"
          >
            <img
              src={src}
              alt={`Product ${i + 1}`}
              className="size-full object-cover"
            />
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[10px] text-white">
                Main
              </span>
            )}
            <button
              type="button"
              aria-label="Remove image"
              disabled={uploading}
              onClick={() => onRemove(i)}
              className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5 text-red-600 disabled:opacity-50"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex size-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#9a9a9a] bg-white text-[11px] text-gray-600 disabled:opacity-50 sm:size-24"
          >
            <Plus className="size-4" />
            {uploading ? "Uploading..." : "Add"}
          </button>
        )}
      </div>
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

function ProductForm({
  initial,
  productId,
  onClose,
}: {
  initial: FormValues;
  productId?: string | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!productId;

  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploading, setUploading] = useState(false);
  const slugTouched = useRef(isEdit);

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categoryOptions"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Category dropdown: the full list (no parent/child logic)
  const categoryOptions = useMemo(
    () => categories.filter((c) => !c.isDeleted),
    [categories],
  );

  // Subcategory dropdown: the same full list, minus the selected category
  const subcategoryOptions = useMemo(
    () => categoryOptions.filter((c) => c._id !== values.category),
    [categoryOptions, values.category],
  );

  const setField = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const handleNameChange = (name: string) => {
    setValues((prev) => ({
      ...prev,
      name,
      slug: slugTouched.current ? prev.slug : slugify(name),
    }));
    setErrors((prev) => ({ ...prev, name: undefined, slug: undefined }));
  };

  const handleCategoryChange = (category: string) => {
    setValues((prev) => ({
      ...prev,
      category,
      // the new category can't also be the subcategory
      subcategory: prev.subcategory === category ? "" : prev.subcategory,
    }));
    setErrors((prev) => ({ ...prev, category: undefined }));
  };

  const updateAttr = (i: number, key: "name" | "values", val: string) =>
    setValues((prev) => ({
      ...prev,
      attributes: prev.attributes.map((a, idx) =>
        idx === i ? { ...a, [key]: val } : a,
      ),
    }));
  const addAttr = () =>
    setValues((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { name: "", values: "" }],
    }));
  const removeAttr = (i: number) =>
    setValues((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, idx) => idx !== i),
    }));

  const addImages = useCallback((urls: string[]) => {
    setValues((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    setErrors((prev) => ({ ...prev, images: undefined }));
  }, []);
  const removeImage = useCallback(
    (i: number) =>
      setValues((prev) => ({
        ...prev,
        images: prev.images.filter((_, idx) => idx !== i),
      })),
    [],
  );

  const { mutate, isPending, error: apiError } = useMutation({
    mutationFn: (payload: ProductPayload) =>
      isEdit
        ? ProductApi.update(String(productId), payload)
        : ProductApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      if (productId)
        queryClient.invalidateQueries({ queryKey: ["productById", productId] });
      onClose();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    mutate(toPayload(values));
  };

  const text = (key: keyof FormValues) => ({
    id: key,
    className: inputClass,
    value: values[key] as string,
    onChange: (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setField(key, e.target.value as never),
  });

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      {/* ---------------------------- Basic info ---------------------------- */}
      <SectionTitle>Basic Info</SectionTitle>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Product Name" required error={errors.name} htmlFor="name">
          <input
            id="name"
            className={inputClass}
            placeholder="eg. Black Toner Cartridge"
            value={values.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </Field>

        <Field label="Slug" required error={errors.slug} htmlFor="slug">
          <input
            id="slug"
            className={inputClass}
            placeholder="black-toner-cartridge"
            value={values.slug}
            onChange={(e) => {
              slugTouched.current = true;
              setField("slug", e.target.value);
            }}
          />
        </Field>

        <Field
          label="Category"
          required
          error={errors.category}
          htmlFor="category"
        >
          <select
            id="category"
            className={inputClass}
            disabled={loadingCategories}
            value={values.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">
              {loadingCategories ? "Loading..." : "Select category"}
            </option>
            {categoryOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Subcategory" htmlFor="subcategory">
          <select
            id="subcategory"
            className={inputClass}
            disabled={loadingCategories}
            value={values.subcategory}
            onChange={(e) => setField("subcategory", e.target.value)}
          >
            <option value="">None</option>
            {subcategoryOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Compatible Description" htmlFor="compatibleDescription">
          <input
            {...text("compatibleDescription")}
            placeholder="eg. Compatible For Canon IR:"
          />
        </Field>

        <Field label="Compatible Values" htmlFor="compatibleValues">
          <input
            {...text("compatibleValues")}
            placeholder="eg. 4525i/ 4535i/ 4545i"
          />
        </Field>
      </div>

      <ImagesUploader
        images={values.images}
        error={errors.images}
        onAdd={addImages}
        onRemove={removeImage}
        onError={(m) => setErrors((p) => ({ ...p, images: m }))}
        onUploadingChange={setUploading}
      />

      {/* --------------------------- Price & stock -------------------------- */}
      <SectionTitle>Price & Stock</SectionTitle>

      {/* 3 inputs always on one line (tighter gap on small screens) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Field
          label="Selling (₹)"
          required
          error={errors.sellingPrice}
          htmlFor="sellingPrice"
        >
          <input
            {...text("sellingPrice")}
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="100"
          />
        </Field>
        <Field
          label="Original (₹)"
          required
          error={errors.originalPrice}
          htmlFor="originalPrice"
        >
          <input
            {...text("originalPrice")}
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="105"
          />
        </Field>
        <Field label="Stock" required error={errors.stock} htmlFor="stock">
          <input
            {...text("stock")}
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
          />
        </Field>
      </div>

      {/* ----------------------- Attributes & highlights -------------------- */}
      <SectionTitle>Attributes & Highlights</SectionTitle>

      <div className="flex flex-col gap-2">
        {values.attributes.map((a, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto] items-start gap-2 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input
              aria-label={`Attribute ${i + 1} name`}
              className={`${inputClass} col-span-2 sm:col-span-1`}
              placeholder="Attribute name"
              value={a.name}
              onChange={(e) => updateAttr(i, "name", e.target.value)}
            />
            <input
              aria-label={`Attribute ${i + 1} values`}
              className={inputClass}
              placeholder="Values, comma separated"
              value={a.values}
              onChange={(e) => updateAttr(i, "values", e.target.value)}
            />
            <button
              type="button"
              aria-label="Remove attribute"
              onClick={() => removeAttr(i)}
              className="rounded-md border border-red-300 bg-white p-2 text-red-600"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addAttr}
          className={`${smallBtnClass} flex w-fit items-center gap-1`}
        >
          <Plus className="size-3" /> Add attribute
        </button>
      </div>

      <Field label="Highlights" hint="one per line" htmlFor="highlights">
        <textarea
          {...text("highlights")}
          rows={3}
          placeholder={"SHARP BLACK OUTPUT\nIDEAL FOR HIGH-VOLUME PRINTING"}
        />
      </Field>

      {/* ------------------------------ Policies ---------------------------- */}
      <SectionTitle>Shipping & Support</SectionTitle>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Ships In" htmlFor="shipsIn">
          <input
            {...text("shipsIn")}
            placeholder="In Stock! Ships Within 1-2 Business Days."
          />
        </Field>
        <Field label="Return Policy" htmlFor="returnPolicy">
          <input
            {...text("returnPolicy")}
            placeholder="Complimentary Shipping & Returns"
          />
        </Field>
        <Field label="Support Info" htmlFor="supportInfo">
          <input {...text("supportInfo")} placeholder="90-Day Customer Support" />
        </Field>
        <Field label="Warranty" htmlFor="warranty">
          <input {...text("warranty")} placeholder="1 year manufacturer warranty" />
        </Field>
      </div>

      {/* ------------------------- Rating, status, SEO ---------------------- */}
      <SectionTitle>Rating, Status & SEO</SectionTitle>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          label="Average Rating"
          error={errors.averageRating}
          htmlFor="averageRating"
        >
          <input
            {...text("averageRating")}
            type="number"
            min={0}
            max={5}
            step="0.1"
            inputMode="decimal"
          />
        </Field>
        <Field
          label="Total Reviews"
          error={errors.totalReviews}
          htmlFor="totalReviews"
        >
          <input
            {...text("totalReviews")}
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field label="Meta Title" htmlFor="metaTitle">
          <input {...text("metaTitle")} placeholder="SEO title" />
        </Field>
        <Field label="Meta Description" htmlFor="metaDescription">
          <textarea
            {...text("metaDescription")}
            rows={2}
            placeholder="SEO description"
          />
        </Field>
      </div>

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
                ? "Update Product"
                : "Save Product"}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*                              ADD / EDIT DIALOG                             */
/* -------------------------------------------------------------------------- */

function ProductDialog({
  open,
  productId,
  onClose,
}: {
  open: boolean;
  productId: string | null;
  onClose: () => void;
}) {
  const isEdit = !!productId;

  const { data, isLoading } = useQuery({
    queryKey: ["productById", productId],
    queryFn: () => ProductApi.getById(String(productId)),
    enabled: open && isEdit,
  });

  const initial = useMemo<FormValues>(
    () => (data?.data ? fromProduct(data.data) : EMPTY),
    [data],
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        // `sm:max-w-[1100px]` overrides the dialog's built-in `sm:max-w-sm`
        className={`${dialogClass} max-h-[90dvh] overflow-y-auto sm:max-w-[1100px]`}
      >
        <DialogHeader className="border-b border-[#D5D5D5] pb-3 text-left">
          <DialogTitle className="text-[14px] font-semibold text-black">
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        {isEdit && isLoading ? (
          <div className="flex flex-col gap-3 py-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          open && (
            <ProductForm
              key={productId ?? "new"}
              initial={initial}
              productId={productId}
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
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (id: string) => ProductApi.remove(id),
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
    <Dialog open={!!product} onOpenChange={(v) => !v && close()}>
      <DialogContent
        aria-describedby={undefined}
        className={`${dialogClass} sm:max-w-[420px]`}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-[14px] font-semibold text-black">
            Delete Product
          </DialogTitle>
        </DialogHeader>

        <p className="mt-2 text-[13px]">
          Are you sure you want to delete product &quot;{product?.name}&quot;?
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
              onClick={() => product && mutate(product._id)}
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

const ProductRow = memo(function ProductRow({
  product: p,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (product: Product) => void;
}) {
  const category = nameOf(p.category);
  const subcategory = nameOf(p.subcategory);

  return (
    <TableRow>
      <TableCell>
        {p.images?.[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            loading="lazy"
            className="h-10 w-14 rounded border border-[#D5D5D5] object-cover"
          />
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="max-w-[220px] truncate" title={p.name}>
        {p.name}
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {category || "-"}
        {subcategory && (
          <span className="block text-[11px] text-gray-500">{subcategory}</span>
        )}
      </TableCell>
      <TableCell>
        <span className="font-medium">{formatPrice(p.sellingPrice)}</span>
        {p.originalPrice > p.sellingPrice && (
          <span className="ml-1 text-[11px] text-gray-500 line-through">
            {formatPrice(p.originalPrice)}
          </span>
        )}
      </TableCell>
      <TableCell className={p.stock === 0 ? "text-red-600" : undefined}>
        {p.stock === 0 ? "Out of stock" : p.stock}
      </TableCell>
      <TableCell>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            p.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {p.isActive ? "Active" : "Inactive"}
        </span>
      </TableCell>
      <TableCell>{formatDate(p.createdAt)}</TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            size="icon"
            aria-label="Edit"
            title="Edit"
            onClick={() => onEdit(p._id)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            aria-label="Delete"
            title="Delete"
            onClick={() => onDelete(p)}
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

const HEADERS = [
  "Image",
  "Product",
  "Category",
  "Price",
  "Stock",
  "Status",
  "Created Date",
  "Actions",
];

export default function ProductSettings() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dialog, setDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: ProductApi.getAll,
  });

  // client-side pagination (API returns the full list)
  const products = data?.data;
  const totalCount = products?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(
    () =>
      (products ?? []).slice((safePage - 1) * pageSize, safePage * pageSize),
    [products, safePage, pageSize],
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
  const closeDelete = useCallback(() => setProductToDelete(null), []);

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-red-600">
        {getErrorMessage(error, "Failed to load products")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full justify-end">
        <Button type="button" onClick={openAdd}>
          <Plus className="mr-2 size-4" />
          Add Product
        </Button>
      </div>

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
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              paged.map((p) => (
                <ProductRow
                  key={p._id}
                  product={p}
                  onEdit={openEdit}
                  onDelete={setProductToDelete}
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

        <div className="flex flex-wrap items-center justify-center gap-3">
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

      <ProductDialog
        open={dialog.open}
        productId={dialog.id}
        onClose={closeDialog}
      />
      <DeleteDialog product={productToDelete} onClose={closeDelete} />
    </div>
  );
}