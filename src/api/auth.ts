const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

async function post<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // keep if the API sets an auth cookie
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.success === false) {
    if (res.status === 404) {
      throw new Error("404 Not Found");
    }
    const msg = data?.message;
    throw new Error(
      Array.isArray(msg) ? msg.join(", ") : msg || "Something went wrong. Try again."
    );
  }
  return data as T;
}

export type RegisterPayload = {
  firstName: string;
  email: string;
  password: string;
  phone: string;
  profileImage?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
};

export type LoginPayload = {
  email: string;
  phone: string;
  password: string;
};

export const authApi = {
  register: (p: RegisterPayload) => post("/auth/register", p),
  sendRegisterOtp: async (identifier: string) => {
    const payload = { identifier };
    try {
      return await post("/auth/send-register-otp", payload);
    } catch (err: any) {
      if (err?.message?.includes("404")) {
        return await post("/send-register-otp", payload);
      }
      throw err;
    }
  },
  verifyRegisterOtp: async (identifier: string, otp: string) => {
    const payload = { identifier, otp };
    try {
      return await post("/auth/verify-register-otp", payload);
    } catch (err: any) {
      if (err?.message?.includes("404")) {
        return await post("/verify-register-otp", payload);
      }
      throw err;
    }
  },

  login: async (payload: LoginPayload) => {
    try {
      return await post("/auth/user/login", payload);
    } catch (err: any) {
      if (err?.message?.includes("404")) {
        return await post("/user/login", payload);
      }
      throw err;
    }
  },
  sendLoginOtp: (identifier: string) => post("/auth/send-login-otp", { identifier }),
  verifyLoginOtp: (identifier: string, otp: string) =>
    post("/auth/verify-login-otp", { identifier, otp }),
};