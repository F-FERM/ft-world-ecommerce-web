import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface PolicyBullet {
  id: string;
  text: ReactNode;
}

interface PolicyTable {
  headers: [string, string];
  rows: [string, string][];
}

interface PolicyCard {
  title: string;
  body: ReactNode;
}

interface PolicySection {
  id: string;
  title: string;
  body?: ReactNode;
  bullets?: PolicyBullet[];
  note?: ReactNode;
  table?: PolicyTable;
  card?: PolicyCard;
}

const LAST_UPDATED = "October 30, 2026";

const DRAFT_NOTICE =
  "This policy is a template for FT WORLD. Confirm the legal entity, contact details, payment providers, refund timelines and applicable consumer-protection laws before publishing.";

const SECTIONS: PolicySection[] = [
  {
    id: "return-policy",
    title: "1. Return Policy",
    body: (
      <>
        FT WORLD aims to help customers resolve eligible order issues. Under this proposed policy,
        return requests may be submitted within{" "}
        <strong className="font-semibold">7 days of delivery</strong> for products that arrive
        damaged, defective, incorrect, or otherwise qualify under the conditions below.
      </>
    ),
  },
  {
    id: "return-eligibility",
    title: "2. Return Eligibility",
    body: "To request a return, the following conditions should generally be met:",
    bullets: [
      { id: "within-7-days", text: "The request is submitted within 7 days after delivery." },
      {
        id: "unused",
        text: "The item is unused, unopened and in its original condition, unless the reported issue requires otherwise.",
      },
      {
        id: "packaging",
        text: "Original packaging, accessories and proof of purchase are available.",
      },
      {
        id: "report-48h",
        text: "Damage, defects or incorrect deliveries are reported within 48 hours, with clear photos or video where possible.",
      },
    ],
    note: "Returns are subject to review and applicable consumer-protection requirements.",
  },
  {
    id: "items-not-returnable",
    title: "3. Items That May Not Be Returnable",
    bullets: [
      {
        id: "consumables",
        text: "Opened or used ink, toner cartridges and other printer consumables, except where a defect or legal right applies.",
      },
      {
        id: "misuse",
        text: "Products damaged through misuse, improper installation or handling.",
      },
      { id: "custom", text: "Personalized, customized or specially sourced items." },
      {
        id: "clearance",
        text: "Clearance products identified as final sale, where legally permitted.",
      },
      {
        id: "vouchers",
        text: "Digital vouchers or gift cards, where applicable and legally permitted.",
      },
    ],
  },
  {
    id: "replacement-policy",
    title: "4. Replacement Policy",
    body: "Replacement may be offered when a product is damaged on arrival, defective, or different from the item ordered. The support team may request images, videos or an inspection. Replacements depend on stock availability; if unavailable, another suitable resolution may be offered.",
    bullets: [
      {
        id: "replacement-processing",
        text: "Indicative processing period: 5–10 business days after approval.",
      },
      { id: "replacement-bank", text: "Bank or payment provider settlement times may vary." },
      {
        id: "replacement-shipping",
        text: "Original shipping fees may be excluded from refunds, except for incorrect, damaged or defective orders or where required by law.",
      },
    ],
  },
  {
    id: "refund-policy",
    title: "5. Refund Policy",
    body: "Once a returned item is received and assessed, FT WORLD would notify the customer whether the refund is approved. Approved refunds are intended to be sent to the original payment method where possible.",
    bullets: [
      {
        id: "refund-processing",
        text: "Indicative processing period: 5–10 business days after approval.",
      },
      { id: "refund-bank", text: "Bank or payment provider settlement times may vary." },
      {
        id: "refund-shipping",
        text: "Original shipping fees may be excluded from refunds, except for incorrect, damaged or defective orders or where required by law.",
      },
    ],
  },
  {
    id: "order-cancellation",
    title: "6. Order Cancellation",
    body: "Customers may request cancellation before dispatch. Once an order has shipped, it may need to be handled through the applicable return process. For eligible pre-dispatch cancellations, a full payment reversal is proposed.",
  },
  {
    id: "how-to-request",
    title: "7. How To Request A Return Or Replacement",
    body: "Contact FT WORLD customer support through the official contact page. Please include:",
    bullets: [
      { id: "req-order", text: "Your order number and the name used for the order." },
      { id: "req-problem", text: "A short explanation of the problem." },
      {
        id: "req-media",
        text: "Clear photographs or video for damaged, defective or incorrect products.",
      },
      { id: "req-invoice", text: "Any relevant invoice or delivery information." },
    ],
  },
  {
    id: "refund-timelines",
    title: "8. Estimated Refund Timelines",
    body: "The following periods are illustrative and should be checked against FT WORLD’s actual payment gateway and banking partners before publication.",
    table: {
      headers: ["Payment method", "Indicative time after approval"],
      rows: [
        ["UPI / Debit / Credit card", "5–7 business days"],
        ["Net banking", "5–10 business days"],
        ["Digital wallet", "3–5 business days"],
      ],
    },
  },
  {
    id: "need-help",
    title: "9. Need Help?",
    card: {
      title: "FT WORLD Customer Support",
      body: "For returns, refunds, replacements or order questions, please use our contact page. Add FT WORLD’s verified support email, telephone number and business address here before publication.",
    },
  },
];

/* Shared text styles */
const bodyText = cn(
  "font-normal tracking-[0.03em] text-[#676767]",
  "text-[14px] leading-[1.6] sm:text-[16px]",
  "2xl:text-[18px] 2xl:leading-[1.6]"
);

const bulletText = cn(
  "font-normal tracking-[0.03em] text-[#303030]",
  "text-[15px] leading-[1.5] sm:text-[18px]",
  "2xl:text-[22px] 2xl:leading-[1.5]"
);

const headingText = cn(
  "font-semibold capitalize tracking-[0px] text-black",
  "text-[26px] leading-[36px] sm:text-[36px] sm:leading-[50px]",
  "2xl:text-[50px] 2xl:leading-[70px]"
);

const cardTitleText = cn(
  "font-semibold tracking-[0px] text-black",
  "text-[18px] leading-[26px] sm:text-[20px]",
  "2xl:text-[26px] 2xl:leading-[36px]"
);

const tableText = cn(
  "font-normal tracking-[0.03em] text-[#303030]",
  "text-[13px] leading-[1.5] sm:text-[15px]",
  "2xl:text-[18px] 2xl:leading-none"
);

/* Horizontal inset shared by the banner and all text, so everything lines up */
const inset = "px-5 sm:px-10 lg:px-20 2xl:px-[150px]";

interface RefundPolicyDraftIntroProps {
  className?: string;
}

const RefundPolicyDraftIntro = ({ className }: RefundPolicyDraftIntroProps) => {
  return (
    <section
      data-slot="refund-policy-draft-intro"
      className={cn(
        "w-full bg-white px-4 pb-8 pt-12 font-[Poppins] sm:px-8 sm:pb-10 sm:pt-16 lg:pt-20 xl:px-12 2xl:px-0 2xl:pb-14 2xl:pt-[50px]",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1759px]">
       

        <div className={inset}>
          

          {/* Policy sections */}
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`refund-${section.id}`}
              className="mt-8 2xl:mt-[44px]"
            >
              <h2 id={`refund-${section.id}`} className={headingText}>
                {section.title}
              </h2>

              {section.body && <p className={cn("mt-2", bodyText)}>{section.body}</p>}

              {section.bullets && (
                <ul className="mt-3 space-y-2 2xl:mt-4 2xl:space-y-3">
                  {section.bullets.map((bullet) => (
                    <li key={bullet.id} className={cn("flex gap-3", bulletText)}>
                      <span aria-hidden="true" className="select-none">
                        •
                      </span>
                      <span>{bullet.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.note && <p className={cn("mt-3", bodyText)}>{section.note}</p>}

              {section.table && (
                <div className="mt-4 overflow-x-auto">
                  <table className={cn("w-full min-w-[420px] border-collapse text-left", tableText)}>
                    <thead>
                      <tr className="bg-[#EEDDED]">
                        {section.table.headers.map((header) => (
                          <th
                            key={header}
                            scope="col"
                            className="px-3 py-2.5 font-medium text-black first:pl-0 2xl:py-3"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map(([method, time]) => (
                        <tr key={method}>
                          <td className="px-3 py-2.5 first:pl-0 2xl:py-3 ">{method}</td>
                          <td className="px-3 py-2.5 2xl:py-3">{time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.card && (
                <div className="mt-4 rounded-[20px] bg-[#EEDDED] p-6 sm:p-8 2xl:rounded-[30px] 2xl:p-10">
                  <h3 className={cardTitleText}>{section.card.title}</h3>
                  <p className={cn("mt-3", bodyText)}>{section.card.body}</p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RefundPolicyDraftIntro;