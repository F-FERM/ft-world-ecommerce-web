"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { authApi, RegisterPayload } from "@/src/api/auth";
import FormField from "./FormField";

type Errors = Partial<Record<"firstName" | "email" | "phone" | "password", string>>;

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

const emptyAddress = {
  addressLine1: "",
  addressLine2: "",
  street: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
};

export default function RegisterForm() {
  const router = useRouter();

  // Basic Form State
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [countryCode, setCountryCode] = useState("+971");
  const [address, setAddress] = useState(emptyAddress);
  const [showAddress, setShowAddress] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState("");
  const [busy, setBusy] = useState(false);

  // Email Verification State
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailOtpBusy, setEmailOtpBusy] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Phone Verification State
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [phoneOtpBusy, setPhoneOtpBusy] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Cooldown countdowns
  useEffect(() => {
    if (emailCooldown <= 0) return;
    const t = setTimeout(() => setEmailCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [emailCooldown]);

  useEffect(() => {
    if (phoneCooldown <= 0) return;
    const t = setTimeout(() => setPhoneCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phoneCooldown]);

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    // Clear validation error on change
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const setA = (k: keyof typeof address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((a) => ({ ...a, [k]: e.target.value }));

  const cleanPhone = form.phone.replace(/[^0-9]/g, "").replace(/^0+/, "");
  const fullPhone = `${countryCode}${cleanPhone}`;

  /* ---------------------- Email OTP Handlers ---------------------- */

  async function handleSendEmailOtp() {
    const trimmed = form.email.trim();
    if (!trimmed) {
      setEmailError("Enter your email address.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError("");
    setEmailOtpBusy(true);
    try {
      await authApi.sendRegisterOtp(trimmed);
      setEmailOtpSent(true);
      setEmailCooldown(30);
      toast.success("OTP sent to " + trimmed);
    } catch (err) {
      const msg = (err as Error).message || "Failed to send email OTP.";
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setEmailOtpBusy(false);
    }
  }

  async function handleVerifyEmailOtp() {
    if (emailOtp.trim().length < 4) {
      setEmailError("Enter the code sent to your email.");
      return;
    }

    setEmailError("");
    setEmailOtpBusy(true);
    try {
      await authApi.verifyRegisterOtp(form.email.trim(), emailOtp.trim());
      setEmailVerified(true);
      toast.success("Email verified successfully! You can now verify your phone.");
    } catch (err) {
      const msg = (err as Error).message || "Invalid or expired OTP.";
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setEmailOtpBusy(false);
    }
  }

  function handleResetEmail() {
    setEmailVerified(false);
    setEmailOtpSent(false);
    setEmailOtp("");
    setEmailError("");
    // Also reset phone verification to preserve step sequence
    setPhoneVerified(false);
    setPhoneOtpSent(false);
    setPhoneOtp("");
    setPhoneError("");
  }

  /* ---------------------- Phone OTP Handlers ---------------------- */

  async function handleSendPhoneOtp() {
    if (!emailVerified) {
      setPhoneError("Please verify your email first.");
      return;
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      setPhoneError("Enter a valid phone number (at least 7 digits).");
      return;
    }

    setPhoneError("");
    setPhoneOtpBusy(true);
    try {
      await authApi.sendRegisterOtp(fullPhone);
      setPhoneOtpSent(true);
      setPhoneCooldown(30);
      toast.success("OTP sent to " + fullPhone);
    } catch (err) {
      const msg = (err as Error).message || "Failed to send phone OTP.";
      setPhoneError(msg);
      toast.error(msg);
    } finally {
      setPhoneOtpBusy(false);
    }
  }

  async function handleVerifyPhoneOtp() {
    if (phoneOtp.trim().length < 4) {
      setPhoneError("Enter the code sent to your phone.");
      return;
    }

    setPhoneError("");
    setPhoneOtpBusy(true);
    try {
      await authApi.verifyRegisterOtp(fullPhone, phoneOtp.trim());
      setPhoneVerified(true);
      toast.success("Phone verified successfully! You can now complete account creation.");
    } catch (err) {
      const msg = (err as Error).message || "Invalid or expired OTP.";
      setPhoneError(msg);
      toast.error(msg);
    } finally {
      setPhoneOtpBusy(false);
    }
  }

  function handleResetPhone() {
    setPhoneVerified(false);
    setPhoneOtpSent(false);
    setPhoneOtp("");
    setPhoneError("");
  }

  /* ----------------------- Submit Registration ----------------------- */

  function validate(): Errors {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "Enter your full name.";
    if (!emailVerified) e.email = "Please verify your email.";
    if (!phoneVerified) e.phone = "Please verify your phone number.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setApiError("");
    if (Object.keys(e).length) return;

    const payload: RegisterPayload = {
      firstName: form.firstName.trim(),
      email: form.email.trim(),
      phone: fullPhone,
      password: form.password,
    };

    const filled = Object.fromEntries(
      Object.entries(address).filter(([, v]) => v.trim() !== "")
    );
    if (Object.keys(filled).length) payload.address = filled;

    setBusy(true);
    try {
      await authApi.register(payload);
      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (err) {
      const msg = (err as Error).message || "Registration failed. Try again.";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const canCreateAccount =
    emailVerified &&
    phoneVerified &&
    form.firstName.trim().length > 0 &&
    form.password.length >= 8 &&
    !busy;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Step Guide / Indicator */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Verification Flow
        </p>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] sm:text-xs">
          <div
            className={`flex items-center justify-center gap-1 rounded-lg py-1.5 px-1 font-medium transition ${
              emailVerified
                ? "bg-emerald-100 text-emerald-800"
                : "bg-purple-100 text-[#542452] font-semibold ring-1 ring-[#542452]/20"
            }`}
          >
            {emailVerified ? (
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
            ) : (
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#542452] text-[10px] text-white">
                1
              </span>
            )}
            <span className="truncate">1. Email OTP</span>
          </div>

          <div
            className={`flex items-center justify-center gap-1 rounded-lg py-1.5 px-1 font-medium transition ${
              phoneVerified
                ? "bg-emerald-100 text-emerald-800"
                : emailVerified
                ? "bg-purple-100 text-[#542452] font-semibold ring-1 ring-[#542452]/20"
                : "bg-slate-200/60 text-slate-400"
            }`}
          >
            {phoneVerified ? (
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
            ) : (
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-slate-400 text-[10px] text-white">
                2
              </span>
            )}
            <span className="truncate">2. Phone OTP</span>
          </div>

          <div
            className={`flex items-center justify-center gap-1 rounded-lg py-1.5 px-1 font-medium transition ${
              canCreateAccount
                ? "bg-emerald-100 text-emerald-800 font-semibold"
                : "bg-slate-200/60 text-slate-400"
            }`}
          >
            {canCreateAccount ? (
              <ShieldCheck className="size-3.5 shrink-0 text-emerald-600" />
            ) : (
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-slate-400 text-[10px] text-white">
                3
              </span>
            )}
            <span className="truncate">3. Register</span>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <FormField
        label="Full name"
        placeholder="e.g. John Doe"
        autoComplete="name"
        value={form.firstName}
        onChange={setF("firstName")}
        error={errors.firstName}
        required
      />

      {/* -------------------- 1. EMAIL & OTP SECTION -------------------- */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Email address <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={setF("email")}
            disabled={emailVerified || emailOtpBusy}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#542452]/20 ${
              emailVerified
                ? "border-emerald-500 bg-emerald-50/30 text-emerald-900"
                : errors.email
                ? "border-red-500"
                : "border-slate-300 focus:border-[#542452]"
            } disabled:bg-slate-50 disabled:text-slate-500`}
            required
          />
          {emailVerified && (
            <span className="absolute inset-y-0 right-3 flex items-center text-emerald-600">
              <CheckCircle2 className="size-4" />
            </span>
          )}
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}

        {/* Email OTP Verification Block */}
        {emailVerified ? (
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Email verified ({form.email})
            </span>
            <button
              type="button"
              onClick={handleResetEmail}
              className="text-xs text-slate-600 underline hover:text-slate-900"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="mt-2.5">
            {!emailOtpSent ? (
              <button
                type="button"
                onClick={handleSendEmailOtp}
                disabled={emailOtpBusy || !form.email.trim()}
                className="inline-flex h-[36px] items-center justify-center rounded-lg bg-[#542452] px-4 text-xs font-medium text-white transition hover:bg-[#6e2d6b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {emailOtpBusy ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Sending OTP…
                  </>
                ) : (
                  "Send Email OTP"
                )}
              </button>
            ) : (
              <div className="rounded-lg border border-purple-100 bg-[#FAF5F9] p-3 text-xs">
                <p className="mb-2 text-slate-700">
                  Enter the OTP code sent to{" "}
                  <span className="font-semibold text-slate-900">{form.email}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    disabled={emailOtpBusy}
                    className="h-[36px] w-36 rounded-md border border-slate-300 bg-white px-3 text-center text-sm font-semibold tracking-widest text-slate-900 outline-none focus:border-[#542452] focus:ring-1 focus:ring-[#542452]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={emailOtpBusy || emailOtp.trim().length < 4}
                    className="inline-flex h-[36px] items-center justify-center rounded-md bg-[#542452] px-4 text-xs font-medium text-white transition hover:bg-[#6e2d6b] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailOtpBusy ? (
                      <>
                        <Loader2 className="mr-1 size-3 animate-spin" /> Verifying…
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailOtpSent(false);
                      setEmailOtp("");
                      setEmailError("");
                    }}
                    className="hover:underline"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={emailCooldown > 0 || emailOtpBusy}
                    className="font-medium text-[#542452] hover:underline disabled:text-slate-400"
                  >
                    {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : "Resend OTP"}
                  </button>
                </div>
                {emailError && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{emailError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* -------------------- 2. PHONE & OTP SECTION -------------------- */}
      <div
        className={`rounded-xl border p-3.5 shadow-sm transition ${
          !emailVerified
            ? "border-slate-200 bg-slate-50/70 opacity-60"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">
            Phone number <span className="text-red-600">*</span>
          </label>
          {!emailVerified && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
              <AlertCircle className="size-3" /> Verify email first
            </span>
          )}
        </div>

        {/* Combined Country Code + Phone Input */}
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            disabled={!emailVerified || phoneVerified || phoneOtpBusy}
            aria-label="Country Code"
            className="h-[42px] max-w-[125px] rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 outline-none transition focus:border-[#542452] focus:ring-2 focus:ring-[#542452]/20 disabled:bg-slate-100 disabled:text-slate-400 sm:text-sm"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <input
              type="tel"
              placeholder="e.g. 50 123 4567"
              autoComplete="tel"
              value={form.phone}
              onChange={setF("phone")}
              disabled={!emailVerified || phoneVerified || phoneOtpBusy}
              className={`h-[42px] w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#542452]/20 ${
                phoneVerified
                  ? "border-emerald-500 bg-emerald-50/30 text-emerald-900"
                  : errors.phone
                  ? "border-red-500"
                  : "border-slate-300 focus:border-[#542452]"
              } disabled:bg-slate-100 disabled:text-slate-400`}
              required
            />
            {phoneVerified && (
              <span className="absolute inset-y-0 right-3 flex items-center text-emerald-600">
                <CheckCircle2 className="size-4" />
              </span>
            )}
          </div>
        </div>
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}

        {/* Phone OTP Verification Block */}
        {!emailVerified ? (
          <p className="mt-2 text-xs text-slate-400">
            Complete Step 1 (Email verification) above to unlock phone verification.
          </p>
        ) : phoneVerified ? (
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Phone verified ({fullPhone})
            </span>
            <button
              type="button"
              onClick={handleResetPhone}
              className="text-xs text-slate-600 underline hover:text-slate-900"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="mt-2.5">
            {!phoneOtpSent ? (
              <button
                type="button"
                onClick={handleSendPhoneOtp}
                disabled={phoneOtpBusy || !cleanPhone || cleanPhone.length < 7}
                className="inline-flex h-[36px] items-center justify-center rounded-lg bg-[#542452] px-4 text-xs font-medium text-white transition hover:bg-[#6e2d6b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {phoneOtpBusy ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Sending OTP…
                  </>
                ) : (
                  "Send Phone OTP"
                )}
              </button>
            ) : (
              <div className="rounded-lg border border-purple-100 bg-[#FAF5F9] p-3 text-xs">
                <p className="mb-2 text-slate-700">
                  Enter the OTP code sent to{" "}
                  <span className="font-semibold text-slate-900">{fullPhone}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    disabled={phoneOtpBusy}
                    className="h-[36px] w-36 rounded-md border border-slate-300 bg-white px-3 text-center text-sm font-semibold tracking-widest text-slate-900 outline-none focus:border-[#542452] focus:ring-1 focus:ring-[#542452]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhoneOtp}
                    disabled={phoneOtpBusy || phoneOtp.trim().length < 4}
                    className="inline-flex h-[36px] items-center justify-center rounded-md bg-[#542452] px-4 text-xs font-medium text-white transition hover:bg-[#6e2d6b] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {phoneOtpBusy ? (
                      <>
                        <Loader2 className="mr-1 size-3 animate-spin" /> Verifying…
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneOtpSent(false);
                      setPhoneOtp("");
                      setPhoneError("");
                    }}
                    className="hover:underline"
                  >
                    Change number
                  </button>
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={phoneCooldown > 0 || phoneOtpBusy}
                    className="font-medium text-[#542452] hover:underline disabled:text-slate-400"
                  >
                    {phoneCooldown > 0 ? `Resend in ${phoneCooldown}s` : "Resend OTP"}
                  </button>
                </div>
                {phoneError && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{phoneError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password */}
      <FormField
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        value={form.password}
        onChange={setF("password")}
        error={errors.password}
        required
      />

      {/* Optional Address Collapsible */}
      <button
        type="button"
        onClick={() => setShowAddress((s) => !s)}
        aria-expanded={showAddress}
        className="text-sm font-medium text-[#542452] hover:underline"
      >
        {showAddress ? "Remove address" : "+ Add address (optional)"}
      </button>

      {showAddress && (
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField
              label="Address line 1"
              value={address.addressLine1}
              onChange={setA("addressLine1")}
            />
          </div>
          <div className="sm:col-span-2">
            <FormField
              label="Address line 2"
              value={address.addressLine2}
              onChange={setA("addressLine2")}
            />
          </div>
          <FormField label="Street" value={address.street} onChange={setA("street")} />
          <FormField label="City" value={address.city} onChange={setA("city")} />
          <FormField label="State" value={address.state} onChange={setA("state")} />
          <FormField label="Country" value={address.country} onChange={setA("country")} />
          <FormField
            label="Postal code"
            value={address.postalCode}
            onChange={setA("postalCode")}
          />
        </div>
      )}

      {apiError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiError}
        </p>
      )}

      {/* ----------------- CREATE ACCOUNT BUTTON ----------------- */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!canCreateAccount}
          className="w-full rounded-lg bg-[#542452] py-2.5 text-sm font-medium text-white transition hover:bg-[#6e2d6b] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>

        {!canCreateAccount && (
          <p className="mt-2 text-center text-xs text-slate-500">
            {!emailVerified
              ? "⚠ Step 1: Verify your email above to continue"
              : !phoneVerified
              ? "⚠ Step 2: Verify your phone number above to enable account creation"
              : !form.firstName.trim()
              ? "Enter your full name"
              : form.password.length < 8
              ? "Password must be at least 8 characters"
              : ""}
          </p>
        )}
      </div>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#542452] hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}