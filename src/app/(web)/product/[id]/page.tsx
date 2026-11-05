import FeaturesStrip from "@/src/components/common/home/Features";
import ProductDetailView from "@/src/components/common/product/ProductDetailView";
import { getProductById, getRelatedProducts, PRODUCTS } from "@/src/components/common/product/Products";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = { params: Promise<{ id: string }> };


export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);
  return { title: product ? product.fullTitle : "Product not found" };
}

async function ProductContent({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return <ProductDetailView product={product} related={getRelatedProducts(id)} />;
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense>
      <ProductContent params={params} />
      <FeaturesStrip/>
    </Suspense>
  );
}