"use client";
import { authApi, RegisterPayload } from "@/src/api/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import OtpForm from "./OtpForm";
import FormField from "./FormField";


type Errors = Partial<Record<"firstName" | "email" | "phone" | "password", string>>;

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
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [form, setForm] = useState({ firstName: "", email: "", phone: "", password: "" });
  const [address, setAddress] = useState(emptyAddress);
  const [showAddress, setShowAddress] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState("");
  const [busy, setBusy] = useState(false);

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const setA = (k: keyof typeof address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((a) => ({ ...a, [k]: e.target.value }));

  function validate(): Errors {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!/^\+?[0-9\s-]{7,15}$/.test(form.phone)) e.phone = "Enter a valid phone number.";
    if (form.password.length < 8) e.password = "Use at least 8 characters.";
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
      phone: form.phone.trim(),
      password: form.password,
    };
    // only send address if the user filled something in
    const filled = Object.fromEntries(
      Object.entries(address).filter(([, v]) => v.trim() !== "")
    );
    if (Object.keys(filled).length) payload.address = filled;

    setBusy(true);
    try {
      await authApi.register(payload);
      router.push("/login");
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (mode === "otp") {
    return (
      <div className="space-y-6">
        <OtpForm
          identifierLabel="Email"
          identifierType="email"
          identifierPlaceholder="you@example.com"
          send={authApi.sendRegisterOtp}
          verify={authApi.verifyRegisterOtp}
          verifyLabel="Verify and register"
          onVerified={() => router.push("/login")}
        />
        <button
          type="button"
          onClick={() => setMode("password")}
          className="w-full text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Register with password instead
        </button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-teal-700 hover:text-teal-800">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField label="Full name" placeholder="John" autoComplete="given-name"
        value={form.firstName} onChange={setF("firstName")} error={errors.firstName} required/>
      <FormField label="Email" type="email" placeholder="you@example.com" autoComplete="email"
        value={form.email} onChange={setF("email")} error={errors.email} required/>
      <FormField label="Phone" type="tel" placeholder="+1234567890" autoComplete="tel"
        value={form.phone} onChange={setF("phone")} error={errors.phone} required/>
      <FormField label="Password" type="password" placeholder="password" autoComplete="new-password"
        value={form.password} onChange={setF("password")} error={errors.password} />

      <button
        type="button"
        onClick={() => setShowAddress((s) => !s)}
        aria-expanded={showAddress}
        className="text-sm font-medium text-[#542452] hover:text-[#542452]"
      >
        {showAddress ? "Remove address" : "Add address (optional)"}
      </button>

      {showAddress && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label="Address line 1" value={address.addressLine1} onChange={setA("addressLine1")} />
          </div>
          <div className="sm:col-span-2">
            <FormField label="Address line 2" value={address.addressLine2} onChange={setA("addressLine2")} />
          </div>
          <FormField label="Street" value={address.street} onChange={setA("street")} />
          <FormField label="City" value={address.city} onChange={setA("city")} />
          <FormField label="State" value={address.state} onChange={setA("state")} />
          <FormField label="Country" value={address.country} onChange={setA("country")} />
          <FormField label="Postal code" value={address.postalCode} onChange={setA("postalCode")} />
        </div>
      )}

      {apiError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-[#542452] py-2.5 text-sm font-medium text-white transition hover:bg-[#542452] disabled:opacity-60"
      >
        {busy ? "Creating account…" : "Create account"}
      </button>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={() => setMode("otp")}
        className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Register with OTP
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#542452] hover:text-[#542452]">
          Log in
        </Link>
      </p>
    </form>
  );
}