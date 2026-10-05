"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/models/product";
import Icon from "@/components/Icon";

type ProductCardItem = Product & { label?: string };

export default function ProductCard({ product }: { product: ProductCardItem }) {
  const { addItem } = useCart();
  const price = product.salePrice ?? product.price;
  const priceLabel = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

  return (
    <article className="product-card">
      <Link
        className="product-image"
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
        style={{ backgroundImage: `url("${product.images?.[0] ?? ""}")` }}
      >
        {product.label && <span className="product-label">{product.label}</span>}
        <span className="product-view">
          View piece <Icon name="arrow" />
        </span>
      </Link>
      <div className="product-info">
        <div>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
        <strong>{priceLabel}</strong>
      </div>
      {product.variants?.length ? (
        <Link className="add-button" href={`/products/${product.slug}`}>
          Choose options <span>+</span>
        </Link>
      ) : (
        <button
          className="add-button"
          disabled={product.stock === 0}
          onClick={() =>
            addItem({
              productId: product.slug,
              name: product.name,
              slug: product.slug,
              price: product.price,
              salePrice: product.salePrice,
              images: product.images ?? [],
              ...(product.sku ? { sku: product.sku } : {}),
              ...(product.stock !== undefined ? { stock: product.stock } : {}),
            })
          }
        >
          {product.stock === 0 ? "Out of stock" : "Add to bag"} <span>+</span>
        </button>
      )}
    </article>
  );
}