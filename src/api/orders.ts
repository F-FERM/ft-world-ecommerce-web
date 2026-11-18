import axiosInstance from "@/src/service/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { isCustomerLoggedIn } from "./useCart";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type PaymentMethod = "COD" | "ONLINE";

export interface PlaceOrderPayload {
  addressId: string;
  paymentMethod: PaymentMethod;
  productIds?: string[];
  couponCode?: string;
  orderNote?: string;
}

export interface DirectOrderItem {
  product: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CreateDirectOrderPayload {
  addressId: string;
  items: DirectOrderItem[];
  subtotal: number;
  tax?: number;
  shippingFee?: number;
  discount?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  orderNote?: string;
}

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  data: unknown;
  statusCode: number;
}

export interface ApiOrderItem {
  product: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ApiAddress {
  fullName: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ApiOrder {
  _id: string;
  isDeleted?: boolean;
  orderId: string;
  items: ApiOrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress?: ApiAddress;
  status: string;
  orderNote?: string;
  createdAt: string;
}

export interface OrdersListResponse {
  success: boolean;
  message: string;
  data: ApiOrder[];
  statusCode: number;
}

/* -------------------------------------------------------------------------- */
/*                                   APIS                                     */
/* -------------------------------------------------------------------------- */

export const PlaceOrderFromCartApi = async (
  payload: PlaceOrderPayload
): Promise<PlaceOrderResponse> => {
  try {
    const res = await axiosInstance.post<PlaceOrderResponse>(
      "/orders/from-cart",
      payload
    );
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data;
      const normalizedError = new Error(
        apiError?.message ?? apiError?.error ?? error.message
      );
      (normalizedError as any).statusCode =
        apiError?.statusCode ?? error.response?.status;
      throw normalizedError;
    }
    throw error;
  }
};

export const CreateDirectOrderApi = async (
  payload: CreateDirectOrderPayload
): Promise<PlaceOrderResponse> => {
  try {
    const res = await axiosInstance.post<PlaceOrderResponse>(
      "/orders",
      payload
    );
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data;
      const normalizedError = new Error(
        apiError?.message ?? apiError?.error ?? error.message
      );
      (normalizedError as any).statusCode =
        apiError?.statusCode ?? error.response?.status;
      throw normalizedError;
    }
    throw error;
  }
};

export const GetOrdersApi = async (): Promise<OrdersListResponse> => {
  try {
    const res = await axiosInstance.get<OrdersListResponse>("/orders");
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data;
      const normalizedError = new Error(
        apiError?.message ?? apiError?.error ?? error.message
      );
      (normalizedError as any).statusCode =
        apiError?.statusCode ?? error.response?.status;
      throw normalizedError;
    }
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*                                   HOOKS                                    */
/* -------------------------------------------------------------------------- */

export const CUSTOMER_ORDERS_KEY = ["customer-orders"] as const;

export const useCustomerOrders = (options?: { enabled?: boolean }) => {
  const loggedIn = isCustomerLoggedIn();

  return useQuery<OrdersListResponse, unknown, ApiOrder[]>({
    queryKey: CUSTOMER_ORDERS_KEY,
    queryFn: GetOrdersApi,
    select: (res) => (res.data ?? []).filter((o) => !o.isDeleted),
    enabled: loggedIn && (options?.enabled ?? true),
  });
};

export const usePlaceOrder = (options?: {
  onSuccess?: (data: PlaceOrderResponse) => void;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlaceOrderPayload) =>
      PlaceOrderFromCartApi(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "Order placed successfully!");
      qc.invalidateQueries({ queryKey: CUSTOMER_ORDERS_KEY });
      options?.onSuccess?.(data);
    },
    onError: (e: unknown) => {
      toast.error((e as Error)?.message ?? "Could not place order");
    },
  });
};

export const useCreateDirectOrder = (options?: {
  onSuccess?: (data: PlaceOrderResponse) => void;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDirectOrderPayload) =>
      CreateDirectOrderApi(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "Order placed successfully!");
      qc.invalidateQueries({ queryKey: CUSTOMER_ORDERS_KEY });
      options?.onSuccess?.(data);
    },
    onError: (e: unknown) => {
      toast.error((e as Error)?.message ?? "Could not place order");
    },
  });
};
