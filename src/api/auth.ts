const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

async function post<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // keep if the API sets an auth cookie
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
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

export const authApi = {
  register: (p: RegisterPayload) => post("/auth/register", p),
  sendRegisterOtp: (identifier: string) => post("/auth/send-register-otp", { identifier }),
  verifyRegisterOtp: (identifier: string, otp: string) =>
    post("/auth/verify-register-otp", { identifier, otp }),

  login: (username: string, password: string) => post("/auth/login", { username, password }),
  sendLoginOtp: (identifier: string) => post("/auth/send-login-otp", { identifier }),
  verifyLoginOtp: (identifier: string, otp: string) =>
    post("/auth/verify-login-otp", { identifier, otp }),
};