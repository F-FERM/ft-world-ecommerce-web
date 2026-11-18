"use client";

import { authApi } from "@/src/api/auth";
import { LocalStorage, TOKEN_KEYS, guestCart } from "@/src/utility/localStorage";
import { AddToCartApi } from "@/src/api/useCart";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import OtpForm from "./OtpForm";
import FormField from "./FormField";

const COUNTRY_CODES = [
  { code: "+971", country: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "United States / Canada", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+961", country: "Lebanon", flag: "🇱🇧" },
];

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+971");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  /** After a successful login: sync guest cart → API, then redirect */
  async function onLoggedIn(data: any) {
    // 1. Save customer token
    const token =
      data?.access_token ??
      data?.data?.access_token ??
      data?.tokens?.accessToken ??
      null;
    if (token) {
      LocalStorage.setItem(TOKEN_KEYS.customer, token);
    }

    // 2. Sync guest_cart items to the customer cart API
    const guestItems = guestCart.get();
    if (guestItems.length > 0) {
      try {
        await Promise.all(
          guestItems.map((item) =>
            AddToCartApi({ productId: item.productId, quantity: item.quantity })
          )
        );
        // 3. Clear guest cart only after successful sync
        guestCart.clear();
      } catch {
        // If sync partially fails, leave guest cart intact for retry
      }
    }

    // 4. Redirect: honour ?redirect param or sessionStorage redirect, else home
    const redirectParam = searchParams?.get("redirect");
    const sessionRedirect =
      typeof window !== "undefined"
        ? sessionStorage.getItem("redirect_after_login")
        : null;

    if (sessionRedirect) {
      sessionStorage.removeItem("redirect_after_login");
    }

    const destination =
      redirectParam === "cart" || sessionRedirect
        ? sessionRedirect ?? "/"
        : "/";

    router.push(destination || "/");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const cleanPhone = phone.replace(/[^0-9]/g, "").replace(/^0+/, "");
    const fullPhone = `${countryCode}${cleanPhone}`;

    if (!email.trim()) return setError("Please enter your email address.");
    if (!cleanPhone || cleanPhone.length < 7) {
      return setError("Please enter a valid phone number.");
    }
    if (!password) return setError("Please enter your password.");

    setError("");
    setBusy(true);
    try {
      const data = await authApi.login({
        email: email.trim(),
        phone: fullPhone,
        password,
      });
      onLoggedIn(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const footer = (
    <p className="text-center text-sm text-slate-500">
      New here?{" "}
      <Link href="/register" className="font-medium text-[#542452] hover:underline">
        Create an account
      </Link>
    </p>
  );

  if (mode === "otp") {
    return (
      <div className="space-y-6">
        <OtpForm
          identifierLabel="Email or phone"
          identifierPlaceholder="you@example.com or +1234567890"
          send={authApi.sendLoginOtp}
          verify={authApi.verifyLoginOtp}
          verifyLabel="Verify and log in"
          onVerified={onLoggedIn}
        />
        <button
          type="button"
          onClick={() => setMode("password")}
          className="w-full text-sm font-medium text-[#542452] hover:text-slate-900"
        >
          Log in with password instead
        </button>
        {footer}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Email */}
      <FormField
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError("");
        }}
        required
      />

      {/* Phone with Country Code */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Phone number <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            disabled={busy}
            aria-label="Country Code"
            className="h-[42px] max-w-[125px] rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 outline-none transition focus:border-[#542452] focus:ring-2 focus:ring-[#542452]/20 disabled:bg-slate-100 disabled:text-slate-400 sm:text-sm"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>

          <input
            type="tel"
            placeholder="e.g. 50 123 4567"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) setError("");
            }}
            disabled={busy}
            className="h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#542452] focus:ring-2 focus:ring-[#542452]/20 disabled:bg-slate-100 disabled:text-slate-400"
            required
          />
        </div>
      </div>

      {/* Password */}
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (error) setError("");
        }}
        required
      />

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-[#542452] py-2.5 text-sm font-medium text-white transition hover:bg-[#6e2d6b] disabled:opacity-60"
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Logging in…
          </span>
        ) : (
          "Log in"
        )}
      </button>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={() => setMode("otp")}
        className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-[#542452] transition hover:bg-slate-50"
      >
        Log in with OTP
      </button>

      {footer}
    </form>
  );
}