import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface PolicyListItem {
  id: string;
  label: string;
  description: string;
}

interface PolicySection {
  id: string;
  title: string;
  /** Short lead-in line shown above a list */
  lead?: string;
  /** Bullet list (label + description) */
  items?: PolicyListItem[];
  /** Paragraph content (can include inline bold via ReactNode) */
  body?: ReactNode;
  /** Optional plain line shown after the body (e.g. website) */
  footer?: ReactNode;
}

const LAST_UPDATED = "October 30, 2026";

const DRAFT_NOTICE =
  "This policy is a template for FT WORLD. Confirm the legal entity, contact details, actual data practices, payment providers and applicable laws before publishing. It does not assert that any specific technology provider is in use.";

const INTRO =
  "FT WORLD (“FT WORLD,” “we,” “us,” or “our”) provides an online shopping experience for printing supplies, technology products and related services through its website (the “Services”). This Privacy Policy explains what personal information we may collect, why we use it, with whom it may be shared, and the choices available to you. Our practices depend on the features and service providers actually enabled on our website.";

const SECTIONS: PolicySection[] = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    lead: "Depending on how you use our Services, we may collect:",
    items: [
      {
        id: "contact-delivery",
        label: "Contact and delivery details:",
        description: "name, email, telephone number, billing and delivery addresses.",
      },
      {
        id: "order",
        label: "Order details:",
        description:
          "products purchased, quantities, order history, delivery preferences, returns and support requests.",
      },
      {
        id: "payment",
        label: "Payment-related details:",
        description:
          "payment method, transaction status and references provided by our payment service providers. We do not claim to store full card numbers.",
      },
      {
        id: "account",
        label: "Account details:",
        description:
          "account identifiers, preferences and authentication information if account registration is enabled.",
      },
      {
        id: "technical",
        label: "Technical information:",
        description:
          "IP address, browser and device details, pages visited, and cookie identifiers where enabled.",
      },
      {
        id: "messages",
        label: "Messages:",
        description:
          "information you voluntarily share through contact, enquiry or customer-support forms.",
      },
    ],
  },
  {
    id: "where-information-comes-from",
    title: "2. Where Information Comes From",
    body: "We may receive information directly from you when you browse, enquire, register or order; automatically through website technologies such as cookies; and from service providers supporting payments, delivery, analytics or customer service where these services are enabled.",
  },
  {
    id: "how-we-use-your-information",
    title: "3. How We Use Your Information",
    body: "We use information as reasonably necessary to operate our online store, including processing and delivering orders, providing invoices and transaction updates, answering questions, managing returns, preventing fraud, securing the website and improving the customer experience. We may send promotional updates where permitted by law and consistent with your preferences. We may also process information to meet legal, tax and regulatory obligations.",
  },
  {
    id: "cookies",
    title: "4. Cookies And Similar Technologies",
    body: "Cookies may be used to remember shopping-cart contents, maintain sessions, improve functionality and measure site performance. Optional analytics or advertising cookies should be enabled and disclosed according to applicable consent requirements. You can manage cookies through your browser and, if available, the website’s cookie settings. Blocking essential cookies may affect site functionality.",
  },
  {
    id: "when-we-share-information",
    title: "5. When We Share Information",
    body: "Where needed to provide the Services, information may be shared with payment processors, shipping and logistics partners, hosting providers, technical support providers and professional advisers, subject to appropriate contractual and security safeguards. We may also disclose information where required by law, to protect legitimate rights, or as part of a lawful business reorganisation. We do not represent that FT WORLD uses Shopify or any other specific platform unless separately confirmed.",
  },
  {
    id: "data-security",
    title: "6. Data Security",
    body: "We aim to use reasonable technical and organisational safeguards appropriate to the information we process. No website or electronic transmission is completely secure. Please use strong passwords where accounts are offered, and avoid sharing sensitive payment details through unsecured messages.",
  },
  {
    id: "how-long-we-keep-information",
    title: "7. How Long We Keep Information",
    body: "We retain personal information only as long as reasonably necessary for the purposes described in this policy, including order fulfilment, customer support, accounting, dispute resolution and legal compliance. Retention periods depend on the type of record and applicable requirements.",
  },
  {
    id: "your-privacy-rights",
    title: "8. Your Privacy Rights And Choices",
    body: "Subject to applicable law, you may be able to request access to, correction of or deletion of your personal information, withdraw consent where processing relies on consent, or raise a concern about how your information is handled. You can opt out of marketing emails using the unsubscribe instructions in those messages. Certain information may need to be retained for legal or legitimate business reasons.",
  },
  {
    id: "childrens-privacy",
    title: "9. Children’s Privacy",
    body: "Our Services are intended for customers legally able to make purchases. We do not knowingly seek personal information from children where parental or guardian consent is required. If you believe a child has supplied personal information inappropriately, please contact us.",
  },
  {
    id: "external-websites",
    title: "10. External Websites",
    body: "Our website may link to third-party websites or services. Their privacy practices are governed by their own policies, and we encourage you to review them before sharing personal information.",
  },
  {
    id: "international-data-transfers",
    title: "11. International Data Transfers",
    body: "If our hosting, fulfilment or other service providers process information in countries other than your own, we will take steps required by applicable law to protect such transfers. The specific destinations and safeguards should be confirmed against FT WORLD’s actual service providers.",
  },
  {
    id: "changes-to-this-policy",
    title: "12. Changes To This Policy",
    body: "We may update this Privacy Policy as our services, technologies or legal obligations change. The latest version will appear on this page with a revised “Last updated” date. Where legally required, we will provide additional notice.",
  },
  {
    id: "contact",
    title: "13. Contact FT WORLD",
    body: (
      <>
        For privacy questions, data requests or complaints, please contact FT WORLD using the
        verified contact details published on our website.{" "}
        <strong className="font-semibold text-black">
          Before publishing this page, insert the legal business name, privacy contact email,
          business address and any required grievance officer details here.
        </strong>
      </>
    ),
    footer: (
      <>
        Website:{" "}
        <a
          href="https://www.ft-world.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          www.ft-world.com
        </a>
      </>
    ),
  },
];

/* Shared text styles */
const bodyText = cn(
  "font-normal tracking-[0.03em] text-[#676767]",
  "text-[14px] leading-[1.7] sm:text-[16px]",
  "2xl:text-[18px] 2xl:leading-[1.7]"
);

const headingText = cn(
  "font-semibold capitalize tracking-[0px] text-black",
  "text-[26px] leading-[36px] sm:text-[36px] sm:leading-[50px]",
  "2xl:text-[50px] 2xl:leading-[70px]"
);

/* Horizontal inset shared by the banner and all text, so everything lines up */
const inset = "px-5 sm:px-10 lg:px-20 2xl:px-[150px]";

interface PolicyDraftIntroProps {
  className?: string;
}

const PolicyDraftIntro = ({ className }: PolicyDraftIntroProps) => {
  return (
    <section
      data-slot="policy-draft-intro"
      className={cn(
        "w-full bg-white px-4 pb-8 pt-12 font-[Poppins] sm:px-8 sm:pb-10 sm:pt-16 lg:pt-20 xl:px-12 2xl:px-0 2xl:pb-14 2xl:pt-[110px]",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1759px]">
        {/* Draft for review banner */}
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
              "text-[32px] leading-[42px] sm:text-[44px] sm:leading-[56px]",
              "2xl:text-[55px] 2xl:leading-[70px]"
            )}
          >
            Draft for review:
          </h2>
          <p className={bodyText}>{DRAFT_NOTICE}</p>
        </div>

        <div className={inset}>
          {/* Last updated */}
          <p className="mt-6 flex flex-wrap items-baseline gap-x-2 2xl:mt-9">
            <span
              className={cn(
                "font-semibold capitalize tracking-[0px] text-black",
                "text-[18px] leading-none 2xl:text-[22px]"
              )}
            >
              Last updated:
            </span>
            <time
              dateTime="2026-10-30"
              className="text-[16px] font-normal leading-none tracking-[0.03em] text-black 2xl:text-[18px]"
            >
              {LAST_UPDATED}
            </time>
          </p>

          {/* Intro */}
          <p className={cn("mt-3 2xl:mt-4", bodyText)}>{INTRO}</p>

          {/* Policy sections */}
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`policy-${section.id}`}
              className="mt-8 2xl:mt-[44px]"
            >
              <h2 id={`policy-${section.id}`} className={headingText}>
                {section.title}
              </h2>

              {section.lead && <p className={cn("mt-1 2xl:mt-2", bodyText)}>{section.lead}</p>}

              {section.items && (
                <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-black 2xl:mt-4 2xl:space-y-3">
                  {section.items.map((item) => (
                    <li key={item.id} className="pl-1">
                      <span
                        className={cn(
                          "font-semibold tracking-[0.03em] text-black",
                          "text-[15px] leading-[1.6] sm:text-[16px] 2xl:text-[22px] 2xl:leading-[1.5]"
                        )}
                      >
                        {item.label}
                      </span>{" "}
                      <span className={bodyText}>{item.description}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.body && <p className={cn("mt-1 2xl:mt-2", bodyText)}>{section.body}</p>}

              {section.footer && (
                <p className={cn("mt-4 2xl:mt-5", bodyText)}>{section.footer}</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PolicyDraftIntro;