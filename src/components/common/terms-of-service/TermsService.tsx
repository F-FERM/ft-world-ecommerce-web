import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface ContactDetail {
  label: string;
  value: ReactNode;
}

interface PolicySection {
  id: string;
  title: string;
  paragraphs?: ReactNode[];
  bullets?: string[];
  note?: ReactNode;
  details?: ContactDetail[];
  card?: boolean;
}

const CHECKLIST_TITLE = "Publication Checklist:";

const CHECKLIST_BODY =
  "This is a draft for FT WORLD. Before publishing, confirm the legal business name, support email, business address, jurisdiction, payment practices and linked policies. These terms do not override mandatory consumer rights.";

const OVERVIEW_TITLE = "Overview";

const OVERVIEW_BODY =
  "Welcome to FT WORLD. Throughout these Terms of Service, “FT WORLD”, “we”, “our” and “us” refer to the business operating this online store. By accessing the website or placing an order, you agree to these Terms, subject to applicable law. Please review them carefully before using our services.";

const SECTIONS: PolicySection[] = [
  {
    id: "eligibility",
    title: "1. Eligibility",
    paragraphs: [
      "You must be legally capable of entering into a purchase contract. If you are under the age of majority in your jurisdiction, you should use the website with permission and supervision from a parent or legal guardian.",
    ],
  },
  {
    id: "online-store-terms",
    title: "2. Online Store Terms",
    paragraphs: ["You agree to use FT WORLD lawfully and responsibly. In particular, you must not:"],
    bullets: [
      "Use the website or products for unlawful or unauthorized activities.",
      "Submit fraudulent orders or inaccurate account information.",
      "Transmit malicious software, interfere with website security or misuse the service.",
      "Infringe the rights of FT WORLD or third parties.",
    ],
    note: "We may restrict access when reasonably necessary to address misuse, fraud or security risks.",
  },
  {
    id: "product-information-pricing",
    title: "3. Product Information & Pricing",
    paragraphs: [
      "We aim to display accurate product descriptions, compatibility information, prices and stock availability. However, inadvertent errors may occur. Product photographs may be illustrative and packaging may vary. Please verify printer-model compatibility before purchasing consumables or replacement components.",
      "Prices, promotions and availability may change. If a material pricing or listing error affects an order, we will contact you about the available options, including cancellation and an appropriate refund where required.",
    ],
  },
  {
    id: "orders-payments",
    title: "4. Orders & Payments",
    paragraphs: [
      "Submitting an order does not guarantee acceptance. Orders are subject to availability, payment verification and applicable fraud-prevention checks. The final order total, including any applicable taxes and delivery charges, should be shown before payment confirmation. Payment methods are those displayed at checkout.",
      "If payment is unsuccessful, an order may remain unconfirmed. We will communicate if an accepted order cannot be fulfilled.",
    ],
  },
  {
    id: "shipping-delivery",
    title: "5. Shipping & Delivery",
    paragraphs: [
      "Available delivery areas, estimated timelines and charges are described at checkout and in our Shipping Policy. Delivery estimates are not guaranteed unless expressly stated. We will provide updates where practical if a shipment is delayed.",
    ],
  },
  {
    id: "returns-refunds",
    title: "6. Returns & Refunds",
    paragraphs: [
      "Return eligibility, product condition requirements, refund methods and replacement procedures are explained in our Return & Refund Policy. Your statutory consumer rights remain unaffected.",
    ],
  },
  {
    id: "order-cancellations",
    title: "7. Order Cancellations",
    paragraphs: [
      "If you need to cancel an order, contact customer support as soon as possible. Whether cancellation is possible depends on the order’s processing and dispatch status. Once an order has shipped, any return or refund request will be handled under the applicable policy and law.",
    ],
  },
  {
    id: "warranty-product-support",
    title: "8. Warranty & Product Support",
    paragraphs: [
      "Where a product includes a manufacturer or seller warranty, the applicable warranty terms will govern its scope and duration. Keep your invoice and product packaging where needed for a claim. Warranty coverage does not limit any rights provided by applicable consumer protection laws.",
    ],
  },
  {
    id: "intellectual-property",
    title: "9. Intellectual Property",
    paragraphs: [
      "FT WORLD’s original website content, branding, layout and other protected materials may not be reproduced or commercially exploited without permission. Third-party brand names and trademarks belong to their respective owners and may be used solely to identify product compatibility.",
    ],
  },
  {
    id: "limitation-of-liability",
    title: "10. Limitation Of Liability",
    paragraphs: [
      "To the extent permitted by applicable law, FT WORLD is not responsible for losses caused by circumstances outside its reasonable control or misuse of products contrary to supplied instructions. Nothing in these Terms excludes or limits liability that cannot legally be excluded, or any mandatory consumer remedies.",
    ],
  },
  {
    id: "indemnification",
    title: "11. Indemnification",
    paragraphs: [
      "To the extent permitted by law, you agree to be responsible for claims and reasonable costs arising from your unlawful use of the website or material breach of these Terms, subject to applicable consumer protections.",
    ],
  },
  {
    id: "third-party-services",
    title: "12. Third-Party Services",
    paragraphs: [
      "The website may use third-party payment, shipping, analytics or technical service providers. Their separate terms or privacy notices may apply when you interact with those services. We are not responsible for independently operated third-party websites, except as required by law.",
    ],
  },
  {
    id: "governing-law",
    title: "13. Governing Law",
    paragraphs: [
      "These Terms will be interpreted under the laws applicable to FT WORLD’s contracting entity and its customers, including mandatory consumer protection rules. The appropriate governing jurisdiction should be confirmed and inserted before publication.",
    ],
  },
  {
    id: "changes-to-these-terms",
    title: "14. Changes To These Terms",
    paragraphs: [
      "We may update these Terms to reflect changes in our business, services or legal requirements. The current version will be published on this page. Changes will apply as permitted by law and will not improperly remove rights associated with existing orders.",
    ],
  },
  {
    id: "contact-information",
    title: "15. Contact Information",
    card: true,
    paragraphs: [
      "For questions about these Terms, an order or a product, contact FT WORLD through the official contact details provided on our website.",
    ],
    details: [
      { label: "Business name:", value: "FT WORLD" },
      {
        label: "Website:",
        value: (
          <a
            href="https://www.ft-world.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            www.ft-world.com
          </a>
        ),
      },
      { label: "Support email:", value: "[Insert verified support email]" },
      { label: "Registered business address:", value: "[Insert verified business address]" },
    ],
  },
];

/* ---------- Shared text styles (Figma values at 2xl, stepped down per breakpoint) ---------- */

/* Poppins 400 / 18px / 3% / #676767 */
const bodyText = cn(
  "break-words font-normal tracking-[0.03em] text-[#676767]",
  "text-[14px] leading-[1.6] sm:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]"
);

/* Poppins 400 / 22px / 3% / #303030 */
const bulletText = cn(
  "break-words font-normal tracking-[0.03em] text-[#303030]",
  "text-[15px] leading-[1.5] sm:text-[16px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px]"
);

/* Poppins 600 / 50px / 70px / capitalize / #000 */
const headingText = cn(
  "break-words font-semibold capitalize tracking-[0px] text-black",
  "text-[26px] leading-[1.3] sm:text-[32px] md:text-[38px] lg:text-[44px] 2xl:text-[50px] 2xl:leading-[70px]"
);

/* Poppins 600 / 32px / 70px / capitalize / #000 */
const overviewTitleText = cn(
  "font-semibold capitalize tracking-[0px] text-black",
  "text-[22px] leading-[1.3] sm:text-[24px] lg:text-[28px] 2xl:text-[32px] 2xl:leading-[70px]"
);

/* Poppins 600 / 22px / 100% / capitalize / #000 */
const checklistTitleText = cn(
  "font-semibold capitalize tracking-[0px] text-black",
  "text-[18px] leading-[1.3] sm:text-[20px] 2xl:text-[22px] 2xl:leading-none"
);

/* Bold label inside the contact card */
const detailLabelText = cn(
  "font-semibold tracking-[0.03em] text-black",
  "text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]"
);

/* Horizontal inset shared by the cards and all text, so everything lines up */
const inset = "px-5 sm:px-8 md:px-12 lg:px-20 2xl:px-[150px]";

/* Pink card shell */
const cardShell = cn(
  "rounded-[20px] bg-[#EEDDED] py-6 sm:py-8 2xl:rounded-[30px] 2xl:py-[30px]",
  inset
);

interface TermsOfServiceDraftIntroProps {
  className?: string;
}

const TermsOfServiceDraftIntro = ({ className }: TermsOfServiceDraftIntroProps) => {
  return (
    <section
      data-slot="terms-of-service-draft-intro"
      className={cn(
        "w-full bg-white px-4 pb-10 pt-10 font-[Poppins] sm:px-8 sm:pb-12 sm:pt-14 lg:pt-16 xl:px-12 2xl:px-0 2xl:pb-[110px] 2xl:pt-[50px]",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1759px]">
        {/* Publication checklist */}
        <div className={inset}>
          <h2 className={checklistTitleText}>{CHECKLIST_TITLE}</h2>
          <p className={cn("mt-3 2xl:mt-4", bodyText)}>{CHECKLIST_BODY}</p>
        </div>

        {/* Overview card */}
        <div className={cn("mt-6 sm:mt-8 2xl:mt-[50px]", cardShell)}>
          <h2 className={overviewTitleText}>{OVERVIEW_TITLE}</h2>
          <p className={cn("mt-2 2xl:mt-0", bodyText)}>{OVERVIEW_BODY}</p>
        </div>

        {/* Terms sections */}
        {SECTIONS.map((section) => {
          const content = (
            <>
              <h2 id={`terms-${section.id}`} className={headingText}>
                {section.title}
              </h2>

              {section.paragraphs && (
                <div className="mt-2 space-y-4 2xl:mt-3 2xl:space-y-6">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index} className={bodyText}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {section.bullets && (
                <ul className="mt-3 space-y-2 sm:space-y-3 2xl:mt-4 2xl:space-y-4">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className={cn("flex gap-3", bulletText)}>
                      <span aria-hidden="true" className="shrink-0 select-none">
                        •
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.note && <p className={cn("mt-3 2xl:mt-4", bodyText)}>{section.note}</p>}

              {section.details && (
                <dl className="mt-4 space-y-1 2xl:mt-5">
                  {section.details.map((detail) => (
                    <div key={detail.label} className={cn("flex flex-wrap gap-x-2", bodyText)}>
                      <dt className={detailLabelText}>{detail.label}</dt>
                      <dd className="break-words">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </>
          );

          return section.card ? (
            <section
              key={section.id}
              aria-labelledby={`terms-${section.id}`}
              className={cn("mt-10 sm:mt-14 2xl:mt-[80px]", cardShell)}
            >
              {content}
            </section>
          ) : (
            <section
              key={section.id}
              aria-labelledby={`terms-${section.id}`}
              className={cn("mt-8 sm:mt-10 2xl:mt-[44px]", inset)}
            >
              {content}
            </section>
          );
        })}
      </div>
    </section>
  );
};

export default TermsOfServiceDraftIntro;