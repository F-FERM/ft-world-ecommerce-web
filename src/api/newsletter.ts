import axiosInstance from "@/src/service/axios";

export interface SubscribePayload {
  email: string;
}

export interface SubscribeResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function subscribeToNewsletter(
  payload: SubscribePayload
): Promise<SubscribeResponse> {
  try {
    const res = await axiosInstance.post<SubscribeResponse>(
      "/newsletter/subscribe",
      payload
    );
    return res.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message = Array.isArray(data?.message)
      ? data.message[0]
      : data?.message || error?.message || "Subscription failed";
    throw new Error(message);
  }
}