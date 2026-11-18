import { getBundleProducts } from "@/src/api/products";
import { Suspense } from "react";
import BuildBundle from "./BuildBundle";


async function BundleLoader() {
  let items;
  try {
    items = await getBundleProducts();
  } catch {
    return null;
  }
  return <BuildBundle items={items} />;
}

const BundleSkeleton = () => (
  <section className="w-full bg-white px-4 py-10 sm:px-8 sm:py-14 xl:px-12 2xl:px-0">
    <div className="mx-auto w-full max-w-[1464px]">
      <div className="h-8 w-64 animate-pulse rounded bg-black/10 sm:h-12" />
      <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 xl:grid-cols-[850fr_574fr]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[260px] animate-pulse rounded-[20px] bg-[#D9D9D9] sm:h-[280px] sm:rounded-[30px]" />
          ))}
        </div>
        <div className="h-[380px] animate-pulse rounded-[20px] bg-[#D9D9D9] sm:h-[420px] sm:rounded-[30px]" />
      </div>
    </div>
  </section>
);

export default function BuildBundleSection() {
  return (
    <Suspense fallback={<BundleSkeleton />}>
      <BundleLoader />
    </Suspense>
  );
}