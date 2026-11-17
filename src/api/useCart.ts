
import axiosInstance from "@/src/service/axios";
import { TOKEN_KEYS, guestCart } from "@/src/utility/localStorage";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { StaticImageData } from "next/image";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;
interface CartApiProduct {
  _id: string;
  isDeleted?: boolean;
  name: string;
  slug: string;
  compatibleDescription: string;
  compatibleValues: string;
  images: string[];
  sellingPrice: number;
  originalPrice: number;
  stock: number;
}

interface CartApiItem {
  product: CartApiProduct;
  quantity: number;
}

interface CartResponse {
  success: boolean;
  data: { _id: string; items: CartApiItem[] };
  message?: string;
  statusCode?: number;
}

export interface AddToCartPayload {
  productId: string;
  quantity?: number;
}

export interface UpdateCartPayload {
  productId: string;
  quantity: number;
}

export interface RemoveFromCartPayload {
  productId: string;
}


export interface CartProduct {
  id: string;
  title: string;
  compatibleWith: string;
  compatibleModels: string;
  price: number;
  compareAtPrice?: number;
  image: StaticImageData | string;
}

export interface CartLine extends CartProduct {
  quantity: number;
  stock?: number;
}

/* -------------------------------------------------------------------------- */
/*                                     APIS                                   */
/* -------------------------------------------------------------------------- */

export const GetCartApi = async () => {
  try {
    const response = await axiosInstance.get<CartResponse>(`/cart`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data;

      const normalizedError = new Error(
        apiError?.message ?? apiError?.error ?? error.message
      );

      (normalizedError as any).statusCode =
        apiError?.statusCode ?? error.response?.status;
      (normalizedError as any).raw = apiError;

      throw normalizedError;
    }
    throw error;
  }
};

export const AddToCartApi = async (payload: AddToCartPayload) => {
  try {
    const response = await axiosInstance.post(`/cart/add`, payload);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

export const UpdateCartApi = async (payload: UpdateCartPayload) => {
  try {
    const response = await axiosInstance.patch(`/cart/update`, payload);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

export const RemoveFromCartApi = async (payload: RemoveFromCartPayload) => {
  try {
    
    const response = await axiosInstance.delete(`/cart/remove`, {
      data: payload,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

export const ClearCartApi = async () => {
  try {
    const response = await axiosInstance.delete(`/cart/clear`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */
export interface CustomError {
  success: boolean;
  data: null;
  message: string;
  statusCode: number;
  error: string;
}

export const CART_KEY = ["cart"] as const;
const FALLBACK_IMAGE = "/products/placeholder.png";

export const getErrorMessage = (e: unknown, fallback = "Something went wrong") =>
  (e as CustomError)?.message || fallback;


// API response -> drawer lines (used as the `select` of the cart query)
const toLines = (res: CartResponse): CartLine[] =>
  (res.data?.items ?? [])
    .filter(
      (i) => i.product && typeof i.product === "object" && !i.product.isDeleted
    )
    .map(({ product: p, quantity }) => ({
      id: p._id,
      title: p.name,
      compatibleWith: p.compatibleDescription,
      compatibleModels: p.compatibleValues,
      price: p.sellingPrice,
      compareAtPrice:
        p.originalPrice > p.sellingPrice ? p.originalPrice : undefined,
      image: p.images?.[0] ?? FALLBACK_IMAGE,
      quantity,
      stock: p.stock,
    }));

// Optimistic edit of the cached cart
const patchCartItems = (
  queryClient: QueryClient,
  fn: (items: CartApiItem[]) => CartApiItem[]
) =>
  queryClient.setQueryData<CartResponse>(CART_KEY, (old) =>
    old
      ? { ...old, data: { ...old.data, items: fn(old.data.items ?? []) } }
      : old
  );

// Refetch once the last in-flight cart mutation settles (not once per click)
const settleCart = (queryClient: QueryClient) => {
  if (queryClient.isMutating({ mutationKey: CART_KEY }) <= 1) {
    queryClient.invalidateQueries({ queryKey: CART_KEY });
  }
};

/* -------------------------------------------------------------------------- */
/*                                    HOOKS                                   */
/* -------------------------------------------------------------------------- */

/** Returns true when a customer (not admin) token is present */
export const isCustomerLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(TOKEN_KEYS.customer);
};

export const useCart = (options?: { enabled?: boolean }) => {
  const loggedIn = isCustomerLoggedIn();

  // Logged-in customer → fetch from API
  const apiCart = useQuery<CartResponse, unknown, CartLine[]>({
    queryKey: CART_KEY,
    queryFn: GetCartApi,
    select: toLines,
    enabled: loggedIn && (options?.enabled ?? true),
  });

  // Guest → read from localStorage
  const guestCartQuery = useQuery<CartLine[]>({
    queryKey: ["guest-cart"],
    queryFn: () =>
      guestCart.get().map((item) => ({
        id: item.productId,
        title: item.name ?? item.productId,
        compatibleWith: item.compatibleWith ?? "",
        compatibleModels: item.compatibleModels ?? "",
        price: item.price ?? 0,
        compareAtPrice: item.compareAtPrice,
        image: item.image ?? FALLBACK_IMAGE,
        quantity: item.quantity,
        stock: item.stock,
      })) as CartLine[],
    enabled: !loggedIn && (options?.enabled ?? true),
    staleTime: 0,
  });

  return loggedIn ? apiCart : guestCartQuery;
};
export interface AddBundlePayload {
  items: { productId: string; quantity: number }[];
}
export async function addBundleToCart(payload: AddBundlePayload) {
  const res = await fetch(`${API_BASE}/cart/add-bundle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message ?? `Failed to add bundle (${res.status})`);
  }

  return json;
}
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const loggedIn = isCustomerLoggedIn();

  return useMutation({
    mutationKey: CART_KEY,
    mutationFn: async (data: AddToCartPayload & {
      name?: string;
      price?: number;
      compareAtPrice?: number;
      compatibleWith?: string;
      compatibleModels?: string;
      image?: string;
      stock?: number;
    }) => {
      if (loggedIn) {
        return await AddToCartApi({
          productId: data.productId,
          quantity: data.quantity ?? 1,
        });
      }
      // Guest: save ALL display details to localStorage
      return guestCart.add({
        productId: data.productId,
        quantity: data.quantity ?? 1,
        name: data.name,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        compatibleWith: data.compatibleWith,
        compatibleModels: data.compatibleModels,
        image: data.image,
        stock: data.stock,
      });
    },
    onSuccess: (_data, variables) => {
      toast.success(`${variables.name ?? "Item"} added to cart`);
      if (loggedIn) {
        queryClient.invalidateQueries({ queryKey: CART_KEY });
      } else {
        queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Couldn't add to cart"));
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const loggedIn = isCustomerLoggedIn();

  return useMutation<
    unknown,
    unknown,
    UpdateCartPayload,
    { previous?: CartResponse }
  >({
    mutationKey: CART_KEY,
    mutationFn: async (data) => {
      if (!loggedIn) {
        // Guest: update localStorage
        return guestCart.update(data.productId, data.quantity);
      }
      return await UpdateCartApi(data);
    },
    // Optimistic update for logged-in; instant for guest (localStorage is sync)
    onMutate: async ({ productId, quantity }) => {
      if (!loggedIn) {
        queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
        return {};
      }
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData<CartResponse>(CART_KEY);
      patchCartItems(queryClient, (items) =>
        items.map((i) =>
          i.product._id === productId ? { ...i, quantity } : i
        )
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (!loggedIn) return;
      if ((context as any)?.previous)
        queryClient.setQueryData(CART_KEY, (context as any).previous);
      toast.error(getErrorMessage(error, "Couldn't update quantity"));
    },
    onSettled: () => {
      if (loggedIn) settleCart(queryClient);
      else queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const loggedIn = isCustomerLoggedIn();

  return useMutation<
    unknown,
    unknown,
    RemoveFromCartPayload & { name?: string },
    { previous?: CartResponse }
  >({
    mutationKey: CART_KEY,
    mutationFn: async (data) => {
      if (!loggedIn) {
        return guestCart.remove(data.productId);
      }
      return await RemoveFromCartApi({ productId: data.productId });
    },
    onMutate: async ({ productId }) => {
      if (!loggedIn) {
        queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
        return {};
      }
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData<CartResponse>(CART_KEY);
      patchCartItems(queryClient, (items) =>
        items.filter((i) => i.product._id !== productId)
      );
      return { previous };
    },
    onSuccess: (_data, variables) => {
      toast.success(`${variables.name ?? "Item"} removed from cart`);
    },
    onError: (error, _variables, context) => {
      if (!loggedIn) return;
      if ((context as any)?.previous)
        queryClient.setQueryData(CART_KEY, (context as any).previous);
      toast.error(getErrorMessage(error, "Couldn't remove item"));
    },
    onSettled: () => {
      if (loggedIn) settleCart(queryClient);
      else queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const loggedIn = isCustomerLoggedIn();

  return useMutation<unknown, unknown, void, { previous?: CartResponse }>({
    mutationKey: CART_KEY,
    mutationFn: async () => {
      if (!loggedIn) {
        guestCart.clear();
        return;
      }
      return await ClearCartApi();
    },
    onMutate: async () => {
      if (!loggedIn) {
        queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
        return {};
      }
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData<CartResponse>(CART_KEY);
      patchCartItems(queryClient, () => []);
      return { previous };
    },
    onSuccess: () => {
      toast.success("Cart cleared");
    },
    onError: (error, _variables, context) => {
      if (!loggedIn) return;
      if ((context as any)?.previous)
        queryClient.setQueryData(CART_KEY, (context as any).previous);
      toast.error(getErrorMessage(error, "Couldn't clear cart"));
    },
    onSettled: () => {
      if (loggedIn) settleCart(queryClient);
      else queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
    },
  });
};