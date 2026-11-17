"use client";
import { useEffect, useState, type FormEvent } from "react";
import FormField from "./FormField";

type Props = {
  identifierLabel: string;
  identifierPlaceholder: string;
  identifierType?: "email" | "tel" | "text";
  send: (identifier: string) => Promise<unknown>;
  verify: (identifier: string, otp: string) => Promise<unknown>;
  onVerified: (data: unknown) => void;
  verifyLabel: string;
};

export default function OtpForm({
  identifierLabel,
  identifierPlaceholder,
  identifierType = "text",
  send,
  verify,
  onVerified,
  verifyLabel,
}: Props) {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSend() {
    if (!identifier.trim()) return setError(`Enter your ${identifierLabel.toLowerCase()}.`);
    setError("");
    setBusy(true);
    try {
      await send(identifier.trim());
      setSent(true);
      setCooldown(30);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (otp.trim().length < 4) return setError("Enter the code we sent you.");
    setError("");
    setBusy(true);
    try {
      onVerified(await verify(identifier.trim(), otp.trim()));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <FormField
        label={identifierLabel}
        type={identifierType}
        placeholder={identifierPlaceholder}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        disabled={sent}
        autoComplete="username"
      />

      {!sent ? (
        <button
          type="button"
          onClick={handleSend}
          disabled={busy}
          className="w-full rounded-lg bg-[#542452] py-2.5 text-sm font-medium text-white transition hover:bg-[#542452] disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send OTP"}
        </button>
      ) : (
        <>
          <FormField
            label="One-time code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter the code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[#542452] py-2.5 text-sm font-medium text-white transition hover:bg-[#542452] disabled:opacity-60"
          >
            {busy ? "Verifying…" : verifyLabel}
          </button>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setOtp("");
                setError("");
              }}
              className="hover:text-slate-800"
            >
              Change {identifierLabel.toLowerCase()}
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={cooldown > 0 || busy}
              className="font-medium text-[#542452] hover:text-[#542452] disabled:text-slate-400"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}