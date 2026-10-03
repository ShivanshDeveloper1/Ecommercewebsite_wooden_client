"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/models/product";

export default function ProductDetail({ product, categoryName }: {
  product: Product;
  categoryName: string | null;
}) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const images = product.images.length ? product.images : [""];
  const hasSale = product.salePrice !== null && product.salePrice < product.price;
  const price = product.salePrice ?? product.price;
  const priceLabel = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
  const originalPriceLabel = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price);

  return (
    <main className="section-wrap py-10 sm:py-16">
      <Link href="/products" className="text-xs text-(--muted) transition hover:text-(--moss)">← Back to all products</Link>
      <div className="mt-6 grid gap-9 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="aspect-[0.9] w-full bg-[#dedbd1] bg-cover bg-center sm:aspect-square" style={images[selectedImage] ? { backgroundImage: `url("${images[selectedImage]}")` } : undefined} role="img" aria-label={`${product.name}, image ${selectedImage + 1}`} />
          {product.images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-3">{product.images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(index)} className={`aspect-square border bg-cover bg-center ${selectedImage === index ? "border-(--moss)" : "border-(--line)"}`} style={{ backgroundImage: `url("${image}")` }} aria-label={`Show image ${index + 1}`} aria-pressed={selectedImage === index} />)}</div>}
        </div>
        <section className="flex flex-col items-start py-2 sm:py-8">
          {categoryName && <Link className="text-xs uppercase tracking-[0.12em] text-(--moss) hover:underline" href={`/category/${product.categoryId}`}>{categoryName}</Link>}
          <h1 className="mt-4 font-serif text-3xl font-normal leading-tight text-(--ink) sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <strong className="text-lg font-medium text-(--ink)">{priceLabel}</strong>
            {hasSale && <span className="text-sm text-(--muted) line-through">{originalPriceLabel}</span>}
          </div>
          <p className="mt-6 max-w-prose whitespace-pre-line text-sm leading-7 text-(--muted)">{product.description}</p>
          <button type="button" className="mt-8 min-h-12 w-full max-w-sm rounded bg-(--moss) px-6 text-sm text-white transition hover:opacity-90" onClick={() => { addItem(product); setAdded(true); }}>
            Add to bag
          </button>
          <p aria-live="polite" className="mt-3 min-h-5 text-xs text-(--moss)">{added ? "Added to your bag." : ""}</p>
          <p className="mt-6 border-t border-(--line) pt-5 text-xs leading-6 text-(--muted)">Thoughtfully made with considered materials. Complimentary shipping on orders over $150.</p>
        </section>
      </div>
    </main>
  );
}