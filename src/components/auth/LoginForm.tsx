"use client";
import { authApi } from "@/src/api/auth";
import { LocalStorage, TOKEN_KEYS, guestCart } from "@/src/utility/localStorage";
import { AddToCartApi } from "@/src/api/useCart";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import OtpForm from "./OtpForm";
import FormField from "./FormField";


export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [username, setUsername] = useState("");
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
    if (!username.trim() || !password) return setError("Enter your email or phone and password.");
    setError("");
    setBusy(true);
    try {
      onLoggedIn(await authApi.login(username.trim(), password));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const footer = (
    <p className="text-center text-sm text-slate-500">
      New here?{" "}
      <Link href="/register" className="font-medium text-teal-700 hover:text-[#542452]">
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
      <FormField label="Email or phone" autoComplete="username" placeholder="you@example.com"
        value={username} onChange={(e) => setUsername(e.target.value)} />
      <FormField label="Password" type="password" autoComplete="current-password"
        value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-[#542452] py-2.5 text-sm font-medium text-white transition hover:bg-[#542452] disabled:opacity-60"
      >
        {busy ? "Logging in…" : "Log in"}
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