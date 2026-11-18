import { useMemo } from "react";
import axiosInstance from "@/src/service/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface WishlistProduct {
  _id: string;
  name: string;
  slug?: string;
  images?: string[];
  image?: string;
  originalPrice?: number;
  price?: number;
  stock?: number;
  compatibleWith?: string;
  compatibleModels?: string;
  category?: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  products: WishlistProduct[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WishlistResponse {
  success: boolean;
  message?: string;
  data: Wishlist;
}

/* -------------------------------------------------------------------------- */
/*                                  QUERY KEY                                 */
/* -------------------------------------------------------------------------- */

export const WISHLIST_KEY = ["wishlist"] as const;

/* -------------------------------------------------------------------------- */
/*                                  API CALLS                                 */
/* -------------------------------------------------------------------------- */

export const GetWishlistApi = async (): Promise<Wishlist | null> => {
  try {
    const res = await axiosInstance.get<WishlistResponse>("/wishlist");
    return res.data?.data ?? null;
  } catch (e: any) {
    // 404 or 401 means wishlist is empty / guest — treat as empty
    if (e?.response?.status === 404 || e?.response?.status === 401) return null;
    throw e;
  }
};

export const ToggleWishlistApi = async (
  productId: string
): Promise<{ wishlist: Wishlist | null; message?: string }> => {
  const res = await axiosInstance.post<WishlistResponse>(
    "/wishlist/toggle",
    { productId }
  );
  return {
    wishlist: res.data?.data ?? null,
    message: res.data?.message,
  };
};

export const ClearWishlistApi = async (): Promise<void> => {
  try {
    await axiosInstance.delete("/wishlist/clear");
  } catch (err: any) {
    if (err?.response?.status === 404) {
      await axiosInstance.delete("/api/wishlist/clear");
    } else {
      throw err;
    }
  }
};

export const RemoveFromWishlistApi = async (
  productId: string
): Promise<{ wishlist: Wishlist | null; message?: string }> => {
  const res = await axiosInstance.post<WishlistResponse>(
    "/wishlist/toggle",
    { productId }
  );
  return {
    wishlist: res.data?.data ?? null,
    message: res.data?.message,
  };
};

/* -------------------------------------------------------------------------- */
/*                                   HOOKS                                    */
/* -------------------------------------------------------------------------- */

/** Fetches the current wishlist (enabled only when logged in). */
export const useWishlist = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: GetWishlistApi,
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
    select: (data) => data?.products ?? [],
  });
};

/** Returns the set of wishlisted product IDs for O(1) lookup. */
export const useWishlistIds = (options?: { enabled?: boolean }) => {
  const { data = [] } = useWishlist(options);
  return useMemo(() => {
    return new Set(data.map((p) => p._id || (p as any).id));
  }, [data]);
};

/** Toggle a product in/out of the wishlist. */
export const useToggleWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => ToggleWishlistApi(productId),
    onSuccess: (result, productId) => {
      const updatedWishlist = result.wishlist;
      qc.setQueryData<Wishlist | null>(WISHLIST_KEY, updatedWishlist);
      qc.invalidateQueries({ queryKey: WISHLIST_KEY });

      const isNowWishlisted = updatedWishlist?.products?.some(
        (p) => (p._id || (p as any).id) === productId
      );
      const defaultMsg = isNowWishlisted
        ? "Added to wishlist"
        : "Removed from wishlist";
      toast.success(result.message || defaultMsg);
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Wishlist update failed");
    },
  });
};

/** Remove a single product from the wishlist. */
export const useRemoveFromWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => RemoveFromWishlistApi(productId),
    onSuccess: (result) => {
      qc.setQueryData<Wishlist | null>(WISHLIST_KEY, result.wishlist);
      qc.invalidateQueries({ queryKey: WISHLIST_KEY });
      toast.success(result.message || "Removed from wishlist");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Could not remove from wishlist");
    },
  });
};

/** Clear the entire wishlist. */
export const useClearWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ClearWishlistApi,
    onSuccess: () => {
      qc.setQueryData<Wishlist | null>(WISHLIST_KEY, null);
      qc.invalidateQueries({ queryKey: WISHLIST_KEY });
      toast.success("Wishlist cleared");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Could not clear wishlist");
    },
  });
};
