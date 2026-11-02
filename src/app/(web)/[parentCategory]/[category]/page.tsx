import { Suspense } from "react";
import CategoryBanner, {
  CategoryBannerSkeleton,
} from "@/src/components/common/category/CategoryBanner";
import ProductListing from "@/src/components/common/ProductListing";
import FeaturesStrip from "@/src/components/common/home/Features";

interface Props {
  params: Promise<{
    parentCategory: string;
    category: string;
  }>;
}


async function CategoryBannerSlot({ params }: Props) {
  const { parentCategory, category } = await params;

  return <CategoryBanner parentCategory={parentCategory} category={category} />;
}

export default function Product({ params }: Props) {
  return (
    <main>
      <Suspense fallback={<CategoryBannerSkeleton />}>
        <CategoryBannerSlot params={params} />
      </Suspense>
      <ProductListing/>
      <FeaturesStrip/>
    </main>
  );
}