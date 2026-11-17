import { getProduct } from "@/src/api/products";
import FeaturesStrip from "@/src/components/common/home/Features";
import ProductDetailView from "@/src/components/common/product/ProductDetailView";

import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found" };

  return {
    title: product.metaTitle || product.fullTitle,
    description: product.metaDescription,
    openGraph: { title: product.fullTitle, images: product.gallery.slice(0, 1) },
  };
}

async function ProductContent({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id); // deduped with generateMetadata
  if (!product) notFound();

  return <ProductDetailView product={product} />;
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense>
      <ProductContent params={params} />
      <FeaturesStrip />
    </Suspense>
  );
}