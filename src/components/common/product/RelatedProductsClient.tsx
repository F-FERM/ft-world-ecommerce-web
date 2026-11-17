"use client";

import { useCallback } from "react";
import ProductCard, { type Product } from "../ProductCard";
import { useAddToCart } from "@/src/api/useCart";

interface RelatedProductsClientProps {
  products: Product[];
  itemClasses: string;
  listClasses: string;
}

export default function RelatedProductsClient({
  products,
  itemClasses,
  listClasses,
}: RelatedProductsClientProps) {
  const { mutate: addToCart, isPending: adding } = useAddToCart();

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (adding) return;
      addToCart({ productId: product.id, quantity: 1, name: product.title });
    },
    [adding, addToCart]
  );

  return (
    <ul className={listClasses}>
      {products.map((p) => (
        <li key={p.id} className={itemClasses}>
          <ProductCard product={p} onAddToCart={handleAddToCart} />
        </li>
      ))}
    </ul>
  );
}
