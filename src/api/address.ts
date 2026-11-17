import axiosInstance from "@/src/service/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface Address {
  _id: string;
  user: string;
  fullName: string;
  phone: string;
  street: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressPayload {
  fullName: string;
  phone: string;
  street: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

interface AddressListResponse {
  success: boolean;
  message: string;
  data: Address[];
  statusCode: number;
}

interface AddressSingleResponse {
  success: boolean;
  message: string;
  data: Address;
  statusCode: number;
}

/* -------------------------------------------------------------------------- */
/*                               QUERY KEY                                    */
/* -------------------------------------------------------------------------- */

export const ADDRESS_KEY = ["addresses"] as const;

/* -------------------------------------------------------------------------- */
/*                                   APIS                                     */
/* -------------------------------------------------------------------------- */

const handleAxiosError = (error: unknown): never => {
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
};

export const GetAddressesApi = async (): Promise<AddressListResponse> => {
  try {
    const res = await axiosInstance.get<AddressListResponse>("/address");
    return res.data;
  } catch (e) {
    return handleAxiosError(e);
  }
};

export const CreateAddressApi = async (
  payload: AddressPayload
): Promise<AddressSingleResponse> => {
  try {
    const res = await axiosInstance.post<AddressSingleResponse>(
      "/address",
      payload
    );
    return res.data;
  } catch (e) {
    return handleAxiosError(e);
  }
};

export const UpdateAddressApi = async (
  id: string,
  payload: Partial<AddressPayload>
): Promise<AddressSingleResponse> => {
  try {
    const res = await axiosInstance.patch<AddressSingleResponse>(
      `/address/${id}`,
      payload
    );
    return res.data;
  } catch (e) {
    return handleAxiosError(e);
  }
};

export const DeleteAddressApi = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/address/${id}`);
  } catch (e) {
    handleAxiosError(e);
  }
};

/* -------------------------------------------------------------------------- */
/*                                  HOOKS                                     */
/* -------------------------------------------------------------------------- */

export const useAddresses = (options?: { enabled?: boolean }) =>
  useQuery<AddressListResponse, unknown, Address[]>({
    queryKey: ADDRESS_KEY,
    queryFn: GetAddressesApi,
    select: (res) => res.data ?? [],
    enabled: options?.enabled ?? true,
  });

export const useCreateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressPayload) => CreateAddressApi(payload),
    onSuccess: () => {
      toast.success("Address saved");
      qc.invalidateQueries({ queryKey: ADDRESS_KEY });
    },
    onError: (e: unknown) => {
      toast.error((e as Error)?.message ?? "Could not save address");
    },
  });
};

export const useUpdateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AddressPayload> }) =>
      UpdateAddressApi(id, payload),
    onSuccess: () => {
      toast.success("Address updated");
      qc.invalidateQueries({ queryKey: ADDRESS_KEY });
    },
    onError: (e: unknown) => {
      toast.error((e as Error)?.message ?? "Could not update address");
    },
  });
};

export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DeleteAddressApi(id),
    onSuccess: () => {
      toast.success("Address deleted");
      qc.invalidateQueries({ queryKey: ADDRESS_KEY });
    },
    onError: (e: unknown) => {
      toast.error((e as Error)?.message ?? "Could not delete address");
    },
  });
};
