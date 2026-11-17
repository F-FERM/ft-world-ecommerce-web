"use client";
import { authApi } from "@/src/api/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import OtpForm from "./OtpForm";
import FormField from "./FormField";


export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);


  function onLoggedIn(_data: unknown) {
    router.push("/");
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