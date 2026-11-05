import { cn } from "@/src/lib/utils";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ServiceHighlights from "./ServiceHighlights";
import RelatedProducts from "./RelatedProducts";
import { ProductDetail } from "./Products";

const containerPadding = "px-4 sm:px-8 xl:px-12 2xl:px-[227px]";

export default function ProductDetailView({
  product,
  related,
}: {
  product: ProductDetail;
  related: ProductDetail[];
}) {
  return (
<main
  className={cn(
    "w-full bg-white pb-8 pt-[100px] sm:pb-12 sm:pt-[130px] 2xl:pt-[150px]",
    containerPadding
  )}
>
       

      <div className="mx-auto w-full max-w-[1464px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-[21px]">
          {/* LEFT: gallery + product details text */}
          <div className="flex flex-col gap-6">
            <ProductGallery images={product.gallery} alt={product.fullTitle} />
            <section>
              <h2 className="text-[32px] font-semibold capitalize leading-[1.2] text-black sm:text-[42px] 2xl:text-[55px] 2xl:leading-[70px]">
                Product Details
              </h2>
              <p className="mt-3 text-[16px] leading-[1.3] tracking-[0.03em] text-[#4E4E4E] sm:text-[18px] 2xl:text-[22px]">
                {product.description}
              </p>
            </section>
          </div>

          {/* RIGHT: info + service box */}
          <div className="flex flex-col gap-6">
            <ProductInfo product={product} />
            <ServiceHighlights />
          </div>
        </div>

        <RelatedProducts products={related} />
      </div>
    </main>
  );
}