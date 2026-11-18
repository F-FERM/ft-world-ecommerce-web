"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";

/* ------------------------------------------------------------------ */
/* API types (GET /privacy-policy)                                     */
/* ------------------------------------------------------------------ */

interface ApiBullet {
  label: string;
  text: string;
}

interface ApiSection {
  sectionNumber: number;
  title: string;
  content: string;
  bulletPoints: ApiBullet[];
}

interface ApiPrivacyPolicy {
  _id: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  introduction: string;
  sections: ApiSection[];
  contactInfo?: { website?: string; details?: string };
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** The banner already has a "Draft for review:" heading, so drop that prefix from the API text. */
const stripDraftPrefix = (text: string) =>
  (text || "").replace(/^\s*draft for review:?\s*/i, "").trim();

/** "October 30, 2026" -> "2026-10-30" for the <time> element (undefined if unparsable). */
const toDateTime = (value: string): string | undefined => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const ensureColon = (label: string) => {
  const t = (label || "").trim();
  return t.endsWith(":") ? t : `${t}:`;
};

const toHref = (site: string) =>
  /^https?:\/\//i.test(site) ? site : `https://${site}`;

/** Bolds `highlight` inside `content` when it appears there (used for the contact notice). */
const withHighlight = (content: string, highlight?: string): ReactNode => {
  const h = (highlight || "").trim();
  if (!h || !content.includes(h)) return content;
  const [before, ...rest] = content.split(h);
  return (
    <>
      {before}
      <strong className="font-semibold text-black">{h}</strong>
      {rest.join(h)}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Shared text styles                                                  */
/* ------------------------------------------------------------------ */

const bodyText = cn(
  "break-words font-normal tracking-[0.03em] text-[#676767]",
  "text-[14px] leading-[1.7] sm:text-[16px]",
  "2xl:text-[18px] 2xl:leading-[1.7]"
);

const headingText = cn(
  "break-words font-semibold capitalize tracking-[0px] text-black",
  "text-[22px] leading-[32px] sm:text-[30px] sm:leading-[42px] lg:text-[36px] lg:leading-[50px]",
  "2xl:text-[50px] 2xl:leading-[70px]"
);

/* Horizontal inset shared by the banner and all text, so everything lines up */
const inset = "px-5 sm:px-10 lg:px-20 2xl:px-[150px]";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface PolicyDraftIntroProps {
  className?: string;
}

const PolicyDraftIntro = ({ className }: PolicyDraftIntroProps) => {
  const [policy, setPolicy] = useState<ApiPrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/privacy-policy`, {
        headers: { "Content-Type": "application/json" },
        signal,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success || !json?.data) {
        throw new Error(json?.message || `Request failed (${res.status})`);
      }
      // `data` is a single policy object; accept an array too.
      const data: ApiPrivacyPolicy = Array.isArray(json.data)
        ? json.data[0]
        : json.data;
      if (!data) throw new Error("Privacy policy not found");
      setPolicy(data);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const wrapper = cn(
    "w-full bg-white px-4 pb-8 pt-12 font-[Poppins] sm:px-8 sm:pb-10 sm:pt-16 lg:pt-20 xl:px-12 2xl:px-0 2xl:pb-14 2xl:pt-[110px]",
    className
  );

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <section data-slot="policy-draft-intro" className={wrapper} aria-busy="true">
        <div className="mx-auto w-full max-w-[1759px] animate-pulse" aria-hidden="true">
          <div className={cn("rounded-[20px] bg-[#EEDDED] py-6 sm:py-8 2xl:rounded-[30px]", inset)}>
            <div className="h-8 w-3/4 max-w-[360px] rounded bg-white/60 sm:h-10" />
            <div className="mt-4 h-4 w-full rounded bg-white/60" />
            <div className="mt-2 h-4 w-5/6 rounded bg-white/60" />
          </div>
          <div className={inset}>
            <div className="mt-6 h-5 w-48 rounded bg-[#EFEFEF]" />
            <div className="mt-3 h-4 w-full rounded bg-[#F1F1F1]" />
            <div className="mt-2 h-4 w-11/12 rounded bg-[#F1F1F1]" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="mt-8">
                <div className="h-7 w-2/3 max-w-[420px] rounded bg-[#E5E5E5] sm:h-9" />
                <div className="mt-3 h-4 w-full rounded bg-[#F1F1F1]" />
                <div className="mt-2 h-4 w-10/12 rounded bg-[#F1F1F1]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ---------- Error ---------- */
  if (error || !policy) {
    return (
      <section data-slot="policy-draft-intro" className={wrapper}>
        <div className="mx-auto w-full max-w-[1759px]">
          <div
            role="alert"
            className={cn(
              "flex flex-col items-start gap-3 rounded-[20px] bg-[#FFECEC] py-6 text-[14px] text-[#C41E1E]",
              "sm:flex-row sm:items-center sm:justify-between sm:py-8 sm:text-[16px] 2xl:rounded-[30px] 2xl:text-[18px]",
              inset
            )}
          >
            <p className="break-words">
              Couldn’t load the privacy policy. {error ?? ""}
            </p>
            <button
              type="button"
              onClick={() => load()}
              className="shrink-0 rounded-full bg-[#55234F] px-5 py-2 text-[13px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E2D6B] sm:text-[14px]"
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- Content ---------- */
  const notice = stripDraftPrefix(policy.subtitle);
  const sections = [...(policy.sections ?? [])].sort(
    (a, b) => a.sectionNumber - b.sectionNumber
  );
  const website = policy.contactInfo?.website?.trim();

  return (
    <section data-slot="policy-draft-intro" className={wrapper}>
      <div className="mx-auto w-full max-w-[1759px]">
        {/* Draft for review banner (only when the API provides a subtitle) */}
        {notice && (
          <div
            role="note"
            className={cn(
              "flex flex-col justify-between gap-3 rounded-[20px] bg-[#EEDDED] py-6",
              "sm:py-8",
              "2xl:min-h-[184px] 2xl:rounded-[30px] 2xl:py-[30px]",
              inset
            )}
          >
            <h2
              className={cn(
                "font-semibold capitalize tracking-[0px] text-black",
                "text-[26px] leading-[36px] sm:text-[40px] sm:leading-[52px] lg:text-[44px] lg:leading-[56px]",
                "2xl:text-[55px] 2xl:leading-[70px]"
              )}
            >
              Draft for review:
            </h2>
            <p className={bodyText}>{notice}</p>
          </div>
        )}

        <div className={inset}>
          {/* Last updated */}
          {policy.lastUpdated && (
            <p className="mt-6 flex flex-wrap items-baseline gap-x-2 2xl:mt-9">
              <span
                className={cn(
                  "font-semibold capitalize tracking-[0px] text-black",
                  "text-[16px] leading-none sm:text-[18px] 2xl:text-[22px]"
                )}
              >
                Last updated:
              </span>
              <time
                dateTime={toDateTime(policy.lastUpdated)}
                className="text-[14px] font-normal leading-none tracking-[0.03em] text-black sm:text-[16px] 2xl:text-[18px]"
              >
                {policy.lastUpdated}
              </time>
            </p>
          )}

          {/* Intro */}
          {policy.introduction && (
            <p className={cn("mt-3 2xl:mt-4", bodyText)}>{policy.introduction}</p>
          )}

          {/* Policy sections */}
          {sections.map((section) => {
            const isContact = /contact/i.test(section.title);
            const bullets = section.bulletPoints ?? [];
            const headingId = `policy-section-${section.sectionNumber}`;

            return (
              <section
                key={section.sectionNumber}
                aria-labelledby={headingId}
                className="mt-8 2xl:mt-[44px]"
              >
                <h2 id={headingId} className={headingText}>
                  {section.title}
                </h2>

                {/* Paragraph. With bullets it acts as the lead-in line above the list. */}
                {section.content && (
                  <p className={cn("mt-1 2xl:mt-2", bodyText)}>
                    {isContact
                      ? withHighlight(section.content, policy.contactInfo?.details)
                      : section.content}
                  </p>
                )}

                {bullets.length > 0 && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-black sm:pl-6 2xl:mt-4 2xl:space-y-3">
                    {bullets.map((item, i) => (
                      <li key={`${section.sectionNumber}-${i}`} className="pl-1">
                        <span
                          className={cn(
                            "break-words font-semibold tracking-[0.03em] text-black",
                            "text-[15px] leading-[1.6] sm:text-[16px] 2xl:text-[22px] 2xl:leading-[1.5]"
                          )}
                        >
                          {ensureColon(item.label)}
                        </span>{" "}
                        <span className={bodyText}>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {isContact && website && (
                  <p className={cn("mt-4 2xl:mt-5", bodyText)}>
                    Website:{" "}
                    <a
                      href={toHref(website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      {website}
                    </a>
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PolicyDraftIntro;