"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
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

/* ------------------------------ Style tokens ------------------------------ */

const inputBase =
  "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-[#542452]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const primaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#542452] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6e2d6b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#542452]/25 disabled:cursor-not-allowed disabled:opacity-50";

const linkBtn =
  "text-xs font-medium text-slate-500 underline-offset-2 transition hover:text-[#542452] hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline";

/* ------------------------------ Small pieces ------------------------------ */

type StepState = "done" | "active" | "idle";

function Stepper({
  steps,
}: {
  steps: { label: string; state: StepState; icon?: ReactNode }[];
}) {
  return (
    <ol className="flex items-start" aria-label="Registration progress">
      {steps.map((s, i) => {
        const prevDone = i > 0 && steps[i - 1].state === "done";
        return (
          <li
            key={s.label}
            aria-current={s.state === "active" ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center gap-1.5 text-center"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2 transition-colors ${
                  prevDone ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-white transition ${
                s.state === "done"
                  ? "bg-emerald-500 text-white"
                  : s.state === "active"
                  ? "bg-[#542452] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {s.state === "done" ? <Check className="size-4" /> : s.icon ?? i + 1}
            </span>
            <span
              className={`text-[11px] font-medium leading-tight sm:text-xs ${
                s.state === "idle" ? "text-slate-400" : "text-slate-800"
              }`}
            >
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StepCard({
  icon,
  title,
  locked,
  verified,
  hint,
  children,
}: {
  icon: ReactNode;
  title: string;
  locked?: boolean;
  verified?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border p-4 transition sm:p-5 ${
        verified
          ? "border-emerald-200 bg-emerald-50/30"
          : locked
          ? "border-slate-200 bg-slate-50/70"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3
          className={`flex items-center gap-2 text-sm font-semibold ${
            locked ? "text-slate-400" : "text-slate-800"
          }`}
        >
          <span
            className={`flex size-7 items-center justify-center rounded-lg ${
              verified
                ? "bg-emerald-100 text-emerald-700"
                : locked
                ? "bg-slate-200/70 text-slate-400"
                : "bg-[#542452]/10 text-[#542452]"
            }`}
          >
            {icon}
          </span>
          {title} <span className="text-red-600">*</span>
        </h3>
        {hint && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
            <AlertCircle className="size-3.5" /> {hint}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function VerifiedBadge({ label, onChange }: { label: string; onChange: () => void }) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-100/60 px-3 py-2.5 text-xs font-medium text-emerald-800">
      <span className="flex min-w-0 items-center gap-1.5">
        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        <span className="truncate">{label}</span>
      </span>
      <button type="button" onClick={onChange} className={linkBtn}>
        Change
      </button>
    </div>
  );
}

function OtpPanel({
  target,
  otp,
  setOtp,
  busy,
  cooldown,
  error,
  changeLabel,
  onVerify,
  onResend,
  onChangeTarget,
}: {
  target: string;
  otp: string;
  setOtp: (v: string) => void;
  busy: boolean;
  cooldown: number;
  error: string;
  changeLabel: string;
  onVerify: () => void;
  onResend: () => void;
  onChangeTarget: () => void;
}) {
  return (
    <div className="mt-3 rounded-xl border border-[#542452]/15 bg-[#FAF5F9] p-3.5">
      <p className="mb-3 break-all text-xs text-slate-600 sm:text-[13px]">
        Enter the code we sent to{" "}
        <span className="font-semibold text-slate-900">{target}</span>
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          aria-label="One-time code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          disabled={busy}
          className={`${inputBase} border-slate-300 text-center text-base font-semibold tracking-[0.5em] focus:border-[#542452] sm:w-44`}
        />
        <button
          type="button"
          onClick={onVerify}
          disabled={busy || otp.trim().length < 4}
          className={`${primaryBtn} sm:flex-1`}
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Verifying…
            </>
          ) : (
            "Verify code"
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onChangeTarget} className={linkBtn}>
          {changeLabel}
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0 || busy}
          className={`${linkBtn} !text-[#542452] disabled:!text-slate-400`}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SendButton({
  busy,
  disabled,
  label,
  onClick,
}: {
  busy: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${primaryBtn} mt-3 w-full sm:w-auto`}
    >
      {busy ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Sending code…
        </>
      ) : (
        label
      )}
    </button>
  );
}

/* -------------------------------- Component -------------------------------- */

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
    // Clear stale OTP-section errors as soon as the user edits the field
    if (k === "email") setEmailError("");
    if (k === "phone") setPhoneError("");
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
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

  const steps: { label: string; state: StepState; icon?: ReactNode }[] = [
    { label: "Verify email", state: emailVerified ? "done" : "active" },
    {
      label: "Verify phone",
      state: phoneVerified ? "done" : emailVerified ? "active" : "idle",
    },
    {
      label: "Create account",
      state: phoneVerified ? "active" : "idle",
      icon: <ShieldCheck className="size-4" />,
    },
  ];

  const helperText = !emailVerified
    ? "Verify your email to continue."
    : !phoneVerified
    ? "Verify your phone number to continue."
    : !form.firstName.trim()
    ? "Enter your full name."
    : form.password.length < 8
    ? "Password must be at least 8 characters."
    : "";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto w-full max-w-xl space-y-5"
    >
      {/* Progress */}
      <div className="rounded-2xl border border-[#542452]/10 bg-gradient-to-br from-[#FAF5F9] to-white px-3 pb-3.5 pt-4 sm:px-6">
        <Stepper steps={steps} />
      </div>

      {/* Full name */}
      <FormField
        label="Full name"
        placeholder="e.g. John Doe"
        autoComplete="name"
        value={form.firstName}
        onChange={setF("firstName")}
        error={errors.firstName}
        required
      />

      {/* Step 1: Email */}
      <StepCard
        icon={<Mail className="size-4" />}
        title="Email address"
        verified={emailVerified}
      >
        <div className="relative">
          <input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-label="Email address"
            value={form.email}
            onChange={setF("email")}
            disabled={emailVerified || emailOtpBusy}
            className={`${inputBase} ${
              emailVerified
                ? "border-emerald-400 pr-10"
                : errors.email
                ? "border-red-500"
                : "border-slate-300 focus:border-[#542452]"
            }`}
            required
          />
          {emailVerified && (
            <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-600" />
          )}
        </div>
        {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
        {!emailOtpSent && emailError && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
            {emailError}
          </p>
        )}

        {emailVerified ? (
          <VerifiedBadge label={`Email verified · ${form.email}`} onChange={handleResetEmail} />
        ) : !emailOtpSent ? (
          <SendButton
            busy={emailOtpBusy}
            disabled={emailOtpBusy || !form.email.trim()}
            label="Send email code"
            onClick={handleSendEmailOtp}
          />
        ) : (
          <OtpPanel
            target={form.email}
            otp={emailOtp}
            setOtp={setEmailOtp}
            busy={emailOtpBusy}
            cooldown={emailCooldown}
            error={emailError}
            changeLabel="Change email"
            onVerify={handleVerifyEmailOtp}
            onResend={handleSendEmailOtp}
            onChangeTarget={() => {
              setEmailOtpSent(false);
              setEmailOtp("");
              setEmailError("");
            }}
          />
        )}
      </StepCard>

      {/* Step 2: Phone */}
      <StepCard
        icon={<Phone className="size-4" />}
        title="Phone number"
        locked={!emailVerified}
        verified={phoneVerified}
        hint={!emailVerified ? "Verify email first" : undefined}
      >
        <div className="flex gap-2">
          <div className="relative w-[7.25rem] shrink-0">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              disabled={!emailVerified || phoneVerified || phoneOtpBusy}
              aria-label="Country code"
              className={`${inputBase} cursor-pointer appearance-none border-slate-300 pl-3 pr-8 font-medium focus:border-[#542452]`}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative min-w-0 flex-1">
            <input
              type="tel"
              placeholder="50 123 4567"
              autoComplete="tel-national"
              aria-label="Phone number"
              value={form.phone}
              onChange={setF("phone")}
              disabled={!emailVerified || phoneVerified || phoneOtpBusy}
              className={`${inputBase} ${
                phoneVerified
                  ? "border-emerald-400 pr-10"
                  : errors.phone
                  ? "border-red-500"
                  : "border-slate-300 focus:border-[#542452]"
              }`}
              required
            />
            {phoneVerified && (
              <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-600" />
            )}
          </div>
        </div>
        {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
        {emailVerified && !phoneOtpSent && !phoneVerified && phoneError && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
            {phoneError}
          </p>
        )}

        {!emailVerified ? (
          <p className="mt-3 text-xs text-slate-400">
            Verify your email above to unlock this step.
          </p>
        ) : phoneVerified ? (
          <VerifiedBadge label={`Phone verified · ${fullPhone}`} onChange={handleResetPhone} />
        ) : !phoneOtpSent ? (
          <SendButton
            busy={phoneOtpBusy}
            disabled={phoneOtpBusy || !cleanPhone || cleanPhone.length < 7}
            label="Send phone code"
            onClick={handleSendPhoneOtp}
          />
        ) : (
          <OtpPanel
            target={fullPhone}
            otp={phoneOtp}
            setOtp={setPhoneOtp}
            busy={phoneOtpBusy}
            cooldown={phoneCooldown}
            error={phoneError}
            changeLabel="Change number"
            onVerify={handleVerifyPhoneOtp}
            onResend={handleSendPhoneOtp}
            onChangeTarget={() => {
              setPhoneOtpSent(false);
              setPhoneOtp("");
              setPhoneError("");
            }}
          />
        )}
      </StepCard>

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

      {/* Optional address */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white">
        <button
          type="button"
          onClick={() => setShowAddress((s) => !s)}
          aria-expanded={showAddress}
          className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#542452] transition hover:bg-[#FAF5F9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#542452]/15"
        >
          <span className="flex items-center gap-2">
            <MapPin className="size-4" />
            {showAddress ? "Remove address" : "Add delivery address"}
            <span className="text-xs font-normal text-slate-400">(optional)</span>
          </span>
          <ChevronDown
            className={`size-4 shrink-0 transition-transform ${showAddress ? "rotate-180" : ""}`}
          />
        </button>

        {showAddress && (
          <div className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-2">
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
      </div>

      {apiError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {apiError}
        </p>
      )}

      {/* Submit */}
      <div className="space-y-2.5 pt-1">
        <button
          type="submit"
          disabled={!canCreateAccount}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#542452] text-sm font-semibold text-white shadow-md shadow-[#542452]/20 transition hover:bg-[#6e2d6b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#542452]/25 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Creating account…
            </>
          ) : (
            <>
              <Lock className="size-4" /> Create account
            </>
          )}
        </button>

        {!canCreateAccount && helperText && (
          <p className="text-center text-xs text-slate-500">{helperText}</p>
        )}
      </div>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#542452] hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}