import axiosInstance from "@/src/service/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

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

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  data: unknown;
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

/* -------------------------------------------------------------------------- */
/*                                   HOOKS                                    */
/* -------------------------------------------------------------------------- */

export const usePlaceOrder = (options?: {
  onSuccess?: (data: PlaceOrderResponse) => void;
}) =>
  useMutation({
    mutationFn: (payload: PlaceOrderPayload) =>
      PlaceOrderFromCartApi(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "Order placed successfully!");
      options?.onSuccess?.(data);
    },
    onError: (e: unknown) => {
      toast.error((e as Error)?.message ?? "Could not place order");
    },
  });
