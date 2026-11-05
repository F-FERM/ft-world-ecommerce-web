import ProductCard from "../ProductCard";
import { ProductDetail } from "./Products";

export default function RelatedProducts({ products }: { products: ProductDetail[] }) {
  if (!products.length) return null;

  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className="text-[32px] font-semibold capitalize leading-[1.2] text-black sm:text-[42px] 2xl:text-[55px] 2xl:leading-[70px]"
      >
        You May Also Like
      </h2>

      <ul className="mt-6 flex snap-x gap-5 overflow-x-auto pb-4">
        {products.map((p) => (
          <li key={p.id} className="flex w-[280px] shrink-0 snap-start sm:w-[320px] 2xl:w-[350px]">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}