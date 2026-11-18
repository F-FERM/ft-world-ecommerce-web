import { getRelatedProducts } from "@/src/api/products";
import RelatedProductsClient from "./RelatedProductsClient";

const HEADING =
  "text-[32px] font-semibold capitalize leading-[1.2] text-black sm:text-[42px] 2xl:text-[55px] 2xl:leading-[70px]";

// same widths for cards and skeletons so nothing jumps when data arrives
const ITEM_CLASSES =
  "flex w-[260px] shrink-0 snap-start min-[400px]:w-[280px] sm:w-[320px] 2xl:w-[350px]";
const LIST_CLASSES =
  "mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:gap-5";

export default async function RelatedProducts({ idOrSlug }: { idOrSlug: string }) {
  const products = await getRelatedProducts(idOrSlug);
  if (!products.length) return null;

  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="related-heading">
      <h2 id="related-heading" className={HEADING}>
        You May Also Like
      </h2>

      <RelatedProductsClient products={products} itemClasses={ITEM_CLASSES} listClasses={LIST_CLASSES} />
    </section>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <section className="mt-12 sm:mt-16" aria-hidden="true">
      <h2 className={HEADING}>You May Also Like</h2>
      <ul className={LIST_CLASSES}>
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className={`${ITEM_CLASSES} h-[320px] animate-pulse rounded-[24px] bg-neutral-100 sm:h-[340px] sm:rounded-[30px] 2xl:h-[400px]`}
          />
        ))}
      </ul>
    </section>
  );
}