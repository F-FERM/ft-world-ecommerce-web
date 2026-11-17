import type { Product } from "@/src/components/common/ProductCard";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;

export interface CategoryProductsResponse {
  success: boolean;
  data: {
    category: { _id: string; name: string; slug: string; description: string; imageUrl: string };
    filters: { priceRange: { min: number; max: number }; totalProductsCount: number };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    products: ApiProduct[];
  };
}

interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  compatibleDescription: string;
  compatibleValues: string;
  category: { slug: string };
  images: string[];
  sellingPrice: number;
  originalPrice: number;
  stock: number;
}

export async function getCategoryProducts(slug: string, page = 1, limit = 12) {
  const res = await fetch(
    `${API_BASE}/products/category/${encodeURIComponent(slug)}/list?page=${page}&limit=${limit}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`Failed to fetch category products (${res.status})`);

  const json: CategoryProductsResponse = await res.json();
  return json.data;
}

// Discount is calculated on the frontend, same as the popular products
const calcDiscount = (selling: number, original: number) =>
  original > selling && original > 0 ? Math.round(((original - selling) / original) * 100) : 0;

export const mapApiProduct = (p: ApiProduct): Product => ({
  id: p._id,
  slug: p.slug,
  title: p.name,
  compatibleFor: p.compatibleDescription,
  models: p.compatibleValues,
  price: p.sellingPrice,
  oldPrice: p.originalPrice,
  discount: calcDiscount(p.sellingPrice, p.originalPrice),
  image: p.images?.[0] ?? "/products/placeholder.png",
  category: p.category.slug,
  inStock: p.stock > 0,
});