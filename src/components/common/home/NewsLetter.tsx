"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

interface NewsletterProps {
  className?: string;
  onSubscribe?: (email: string) => void | Promise<void>;
}

const Newsletter = ({ className, onSubscribe }: NewsletterProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await onSubscribe?.(email.trim());
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("idle");
    }
  };

  return (
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
              "mt-2  font-semibold capitalize tracking-[0%] text-black",
              "text-[28px] leading-[36px] sm:text-[36px] sm:leading-[46px]",
              "xl:text-[44px] xl:leading-[54px] 2xl:text-[55px] 2xl:leading-[65px]"
            )}
          >
            Good supplies. Great updates.
          </h2>

          <p
            className={cn(
              "mt-2  font-normal leading-[100%] tracking-[0.03em] text-[#676767]",
              "text-[14px] sm:text-[16px] 2xl:text-[18px]"
            )}
          >
            Sign up for new product and offer announcements.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:w-auto lg:shrink-0"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Your email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email Address"
            autoComplete="email"
            className={cn(
              "h-12 w-full rounded-[10px] border border-[#C4C4C4] bg-[#FFFFFFB2] px-[18px] py-[10px]",
              " text-[14px] font-normal leading-[100%] text-black placeholder:capitalize placeholder:text-[#737373]",
              "sm:flex-1 lg:w-[300px] lg:flex-none xl:w-[340px] 2xl:h-[60px] 2xl:w-[385px] 2xl:text-[18px]",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#542452]/40"
            )}
          />

          <Button
            type="submit"
            variant="subscribe"
            size="none"
            disabled={status === "loading"}
            className="w-full shrink-0 sm:w-auto"
          >
            {status === "done" ? "Subscribed" : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;