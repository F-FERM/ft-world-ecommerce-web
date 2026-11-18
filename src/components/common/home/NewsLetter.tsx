"use client";

import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { subscribeToNewsletter } from "@/src/api/newsletter";
import { CheckCircle2, XCircle, X } from "lucide-react";

type Status = "idle" | "loading" | "done" | "error";

/* -------------------------------------------------------------------------- */
/*                                  TOAST UI                                  */
/* -------------------------------------------------------------------------- */

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      className={cn(
        "fixed z-[100] flex items-center gap-3 rounded-xl border bg-white p-4 shadow-lg transition-all",
        "animate-in slide-in-from-top-2 fade-in duration-300",
        // Positioning: top center on mobile, top right on desktop
        "top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 sm:w-auto sm:max-w-md",
        type === "success" ? "border-green-200" : "border-red-200"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="size-5 shrink-0 text-green-600" />
      ) : (
        <XCircle className="size-5 shrink-0 text-red-600" />
      )}
      
      <p className="flex-1 text-[14px] font-medium text-gray-900">{message}</p>
      
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Close notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

interface NewsletterProps {
  className?: string;
  /** Optional callback fired after a successful subscription (analytics, etc.) */
  onSubscribed?: (email: string) => void;
}

const Newsletter = ({ className, onSubscribed }: NewsletterProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isLoading = status === "loading";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (status === "done" || status === "error") {
      setStatus("idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || isLoading) return;

    setStatus("loading");

    try {
      await subscribeToNewsletter({ email: trimmed });
      setStatus("done");
      setEmail("");
      setToast({ message: "Thanks for subscribing!", type: "success" });
      onSubscribed?.(trimmed);
    } catch (error) {
      setStatus("error");
      setToast({
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        type: "error",
      });
    }
  };

  const closeToast = () => {
    setToast(null);
    if (status === "error") setStatus("idle"); // Reset status if error so button isn't stuck
  };

  return (
    <>
      {/* Render Toast if active */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      <section
        data-slot="newsletter"
        className={cn("w-full bg-white px-4 py-6 sm:px-8 sm:py-10 2xl:px-[81px]", className)}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-[1759px] flex-col items-start gap-6 rounded-[24px] bg-[#EEDDED] sm:rounded-[30px]",
            "px-5 py-6 sm:px-10 sm:py-8",
            "lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-16",
            "xl:px-24 2xl:min-h-[252px] 2xl:px-[150px] 2xl:py-5"
          )}
        >
          {/* Text */}
          <div className="flex max-w-[780px] flex-col items-start">
            <p
              className={cn(
                "font-semibold uppercase leading-[100%] tracking-[0%] text-primary",
                "text-[14px] sm:text-[16px] 2xl:text-[18px]"
              )}
            >
              Stay In The Loop
            </p>

            <h2
              className={cn(
                "mt-2 font-semibold capitalize tracking-[0%] text-black",
                "text-[28px] leading-[36px] sm:text-[36px] sm:leading-[46px]",
                "xl:text-[44px] xl:leading-[54px] 2xl:text-[55px] 2xl:leading-[65px]"
              )}
            >
              Good supplies. Great updates.
            </h2>

            <p
              className={cn(
                "mt-2 font-normal leading-[1.4] tracking-[0.03em] text-[#676767]",
                "text-[14px] sm:text-[16px] 2xl:text-[18px]"
              )}
            >
              Sign up for new product and offer announcements.
            </p>
          </div>

          {/* Form */}
          <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0">
            <form
              onSubmit={handleSubmit}
              noValidate={false}
              className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Your email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Your Email Address"
                autoComplete="email"
                aria-invalid={status === "error"}
                className={cn(
                  "h-12 w-full rounded-[10px] border border-[#C4C4C4] bg-[#FFFFFFB2] px-[18px] py-[10px]",
                  "text-[14px] font-normal leading-[100%] text-black placeholder:capitalize placeholder:text-[#737373]",
                  "sm:flex-1 lg:w-[300px] lg:flex-none xl:w-[340px] 2xl:h-[60px] 2xl:w-[385px] 2xl:text-[18px]",
                  "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#542452]/40",
                  "disabled:cursor-not-allowed disabled:opacity-70",
                  status === "error" && "border-red-500"
                )}
              />

              <Button
                type="submit"
                variant="subscribe"
                size="none"
                disabled={isLoading}
                aria-busy={isLoading}
                className="w-full shrink-0 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {isLoading ? "Subscribing..." : status === "done" ? "Subscribed" : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Newsletter;