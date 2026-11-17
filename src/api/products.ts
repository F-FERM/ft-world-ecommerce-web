import { cache } from "react";
import type { Product } from "@/src/components/common/ProductCard"; // adjust path
import { StaticImageData } from "next/image";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const FALLBACK_IMAGE = "/products/placeholder.png";

/* ----------------------------- API types ----------------------------- */

export interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  compatibleDescription: string;
  compatibleValues: string;
  category: { slug: string };
  images: string[];
  sellingPrice: number;
  originalPrice: number;
  stock: number;
  highlights?: string[];
  shipsIn?: string;
  returnPolicy?: string;
  supportInfo?: string;
  warranty?: string;
  metaTitle?: string;
  metaDescription?: string;
}

/* ------------------------- UI types (detail page) ------------------------- */

export interface ProductDetail {
  id: string;
  slug: string;
  fullTitle: string;
  description: string;
  features: string[];
  gallery: string[];
  price: number;
  oldPrice?: number;
  discount: number;
  stock: number;
  inStock: boolean;
  /** e.g. "COMPATIBLE FOR CANON IR:" */
  compatibleFor?: string;
  /** e.g. "4525i/ 4535i/ 4545i 4725 (CEXV53)" */
  compatibleModels?: string;
  shipsIn?: string;
  supportInfo?: string;
  warranty?: string;
  returnPolicy?: string;
  metaTitle?: string;
  metaDescription?: string;
}
export interface BundleItem {
  id: string;
  productId: string; // _id sent to /cart/add-bundle
  title: string;
  price: number;
  oldPrice: number;
  image?: StaticImageData | string;
  inStock: boolean;
}


interface ProductsResponse {
  success: boolean;
  data: ApiProduct[];
}
/* ------------------------------- helpers ------------------------------- */

export const calcDiscount = (selling: number, original: number) =>
  original > 0 && original > selling
    ? Math.round(((original - selling) / original) * 100)
    : 0;

// ProductCard shape (also reusable in PopularProducts)
export const toCardProduct = (p: ApiProduct): Product => {
  const discount = calcDiscount(p.sellingPrice, p.originalPrice);
  return {
    id: p._id,
    title: p.name,
    compatibleFor: p.compatibleDescription,
    models: p.compatibleValues,
    price: p.sellingPrice,
    oldPrice: discount > 0 ? p.originalPrice : undefined,
    discount,
    image: p.images?.[0] ?? FALLBACK_IMAGE,
    category: p.category?.slug,
    href: `/product/${p.slug}`,
  };
};

// Detail page shape
const toProductDetail = (p: ApiProduct): ProductDetail => {
  const discount = calcDiscount(p.sellingPrice, p.originalPrice);
  return {
    id: p._id,
    slug: p.slug,
    fullTitle: p.name,
    description:
      p.description?.trim() ||
      [p.compatibleDescription, p.compatibleValues].filter(Boolean).join(" "),
    features: p.highlights ?? [],
    gallery: p.images?.length ? p.images : [FALLBACK_IMAGE],
    price: p.sellingPrice,
    oldPrice: discount > 0 ? p.originalPrice : undefined,
    discount,
    stock: p.stock,
    inStock: p.stock > 0,
    compatibleFor: p.compatibleDescription,
    compatibleModels: p.compatibleValues,
    shipsIn: p.shipsIn,
    supportInfo: p.supportInfo,
    warranty: p.warranty,
    returnPolicy: p.returnPolicy,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
  };
};

/* -------------------------------- fetchers -------------------------------- */

async function getJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 300 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${path}`);
  return res.json();
}

// cache() => generateMetadata and the page share ONE request per render
export const getProduct = cache(async (idOrSlug: string): Promise<ProductDetail | null> => {
  const json = await getJson<{ data: ApiProduct | { product: ApiProduct } }>(
    `/products/${encodeURIComponent(idOrSlug)}`
  );
  const raw = json?.data;
  if (!raw) return null;
  return toProductDetail("product" in raw ? raw.product : raw);
});

export const getRelatedProducts = cache(async (idOrSlug: string): Promise<Product[]> => {
  try {
    const json = await getJson<{ data: ApiProduct[] | { products: ApiProduct[] } }>(
      `/products/${encodeURIComponent(idOrSlug)}/you-may-like`
    );
    const raw = json?.data;
    const list = Array.isArray(raw) ? raw : raw?.products ?? [];
    return list.map(toCardProduct);
  } catch {
    return []; // a related-products failure should never break the page
  }
});

const BUNDLE_LIMIT = 4;

export async function getBundleProducts(): Promise<BundleItem[]> {
  const res = await fetch(`${API_URL}/products`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);

  const json: ProductsResponse = await res.json();

  return (json.data ?? []).slice(0, BUNDLE_LIMIT).map((p) => ({
    id: p._id,
    productId: p._id,
    title: p.name,
    price: p.sellingPrice,
    oldPrice: p.originalPrice,
    image: p.images?.[0],
    inStock: p.stock > 0,
  }));
}