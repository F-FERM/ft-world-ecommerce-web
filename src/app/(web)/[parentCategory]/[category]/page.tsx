import { Suspense } from "react";
import { notFound } from "next/navigation";
import CategoryBanner, { CategoryBannerSkeleton } from "@/src/components/common/category/CategoryBanner";
import ProductListing, { ProductListingSkeleton } from "@/src/components/common/ProductListing";
import FeaturesStrip from "@/src/components/common/home/Features";
import { getCategoryProducts, mapApiProduct } from "@/src/api/categoryproduct";


interface Props {
  params: Promise<{ parentCategory: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function CategoryContent({ params, searchParams }: Props) {

  
  const { parentCategory, category } = await params;
  const { page } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  let data;
  try {
    data = await getCategoryProducts(category, pageNumber);
  } catch {
    notFound();
  }

  return (
    <>
      <CategoryBanner
        parentCategory={parentCategory}
        category={category}
        title={data.category.name}
        image={data.category.imageUrl}
      />
      <ProductListing
        products={data.products.map(mapApiProduct)}
        priceRange={data.filters.priceRange}
        pagination={data.pagination}
        basePath={`/${parentCategory}/${category}`}
      />
    </>
  );
}

export default function Product(props: Props) {
  return (
    <main>
      <Suspense
        fallback={
          <>
            <CategoryBannerSkeleton />
            <ProductListingSkeleton />
          </>
        }
      >
        <CategoryContent {...props} />
      </Suspense>
      <FeaturesStrip />
    </main>
  );
}