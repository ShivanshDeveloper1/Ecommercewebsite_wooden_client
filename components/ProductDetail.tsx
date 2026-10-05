"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { findMatchingVariant, getAvailableAttributeValues } from "@/lib/product-variants";
import type { Product, ProductAttribute } from "@/models/product";

function legacyAttributes(product: Product): ProductAttribute[] {
  return [
    ...(product.colors?.length ? [{ id: "legacy-color", name: "Color", values: product.colors }] : []),
    ...(product.sizes?.length ? [{ id: "legacy-size", name: "Size", values: product.sizes }] : []),
  ];
}

function initialSelection(product: Product, attributes: ProductAttribute[]) {
  const firstAvailableVariant = product.variants?.find((variant) => variant.stock > 0) ?? product.variants?.[0];
  if (firstAvailableVariant) return firstAvailableVariant.attributes;
  return Object.fromEntries(attributes.map((attribute) => [attribute.id, attribute.values[0] ?? ""]));
}

export default function ProductDetail({ product, categoryName }: {
  product: Product;
  categoryName: string | null;
}) {
  const { addItem } = useCart();
  const hasVariants = Boolean(product.variants?.length);
  const attributes = hasVariants ? product.attributes ?? [] : legacyAttributes(product);
  const variants = product.variants ?? [];
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    () => initialSelection(product, attributes),
  );
  const [added, setAdded] = useState("");

  const selectedVariant = hasVariants ? findMatchingVariant(variants, selectedAttributes) : null;
  const availableImages = selectedVariant?.images?.length ? selectedVariant.images : product.images;
  const images = availableImages.length ? availableImages : [""];
  const price = selectedVariant
    ? selectedVariant.salePrice ?? selectedVariant.price
    : product.salePrice ?? product.price;
  const stock = hasVariants ? selectedVariant?.stock : product.stock;
  const sku = hasVariants ? selectedVariant?.sku : product.sku;
  const cartAttributes = Object.fromEntries(
    attributes
      .filter((attribute) => selectedAttributes[attribute.id])
      .map((attribute) => [attribute.name, selectedAttributes[attribute.id]]),
  );
  const priceLabel = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
  const selectionComplete = !hasVariants || selectedVariant !== null;

  function availableValues(attributeIndex: number, attribute: ProductAttribute) {
    if (!hasVariants) return new Set(attribute.values);
    const earlierAttributeIds = new Set(attributes.slice(0, attributeIndex).map((item) => item.id));
    const priorSelections = Object.fromEntries(
      Object.entries(selectedAttributes).filter(([key]) => earlierAttributeIds.has(key)),
    );
    return getAvailableAttributeValues(variants, attribute.id, priorSelections);
  }

  function selectAttribute(attributeIndex: number, attribute: ProductAttribute, value: string) {
    setAdded("");
    if (!hasVariants) {
      setSelectedAttributes((current) => ({ ...current, [attribute.id]: value }));
      return;
    }

    const nextSelection = Object.fromEntries(
      Object.entries(selectedAttributes).filter(([key]) =>
        attributes.slice(0, attributeIndex).some((item) => item.id === key),
      ),
    );
    nextSelection[attribute.id] = value;

    for (const nextAttribute of attributes.slice(attributeIndex + 1)) {
      const available = getAvailableAttributeValues(variants, nextAttribute.id, nextSelection);
      const nextValue = nextAttribute.values.find((option) => available.has(option));
      if (nextValue) nextSelection[nextAttribute.id] = nextValue;
    }

    setSelectedAttributes(nextSelection);
    setSelectedImage(0);
  }

  function handleAddToCart() {
    if (hasVariants && (!selectedVariant || selectedVariant.stock < 1)) return;
    if (!hasVariants && product.stock === 0) return;

    const wasAdded = addItem({
      productId: product.slug,
      name: product.name,
      slug: product.slug,
      price: selectedVariant?.price ?? product.price,
      salePrice: selectedVariant ? selectedVariant.salePrice ?? null : product.salePrice,
      images: selectedVariant?.images?.length ? selectedVariant.images : product.images,
      ...(selectedVariant ? { variantId: selectedVariant.variantId } : {}),
      ...(Object.keys(cartAttributes).length > 0 ? { selectedAttributes: cartAttributes } : {}),
      ...(sku ? { sku } : {}),
      ...(stock !== undefined ? { stock } : {}),
    });
    setAdded(wasAdded ? "Added to your bag." : "That quantity is not available in stock.");
  }

  return (
    <main className="section-wrap py-10 sm:py-16">
      <Link href="/products" className="text-xs text-(--muted) transition hover:text-(--moss)">
        ← Back to all products
      </Link>
      <div className="mt-6 grid gap-9 lg:grid-cols-2 lg:gap-16">
        <div>
          <div
            className="aspect-[0.9] w-full bg-[#dedbd1] bg-cover bg-center sm:aspect-square"
            style={images[selectedImage] ? { backgroundImage: `url("${images[selectedImage]}")` } : undefined}
          />
          {availableImages.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-3">
              {availableImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  aria-label={`View product image ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square border bg-cover bg-center ${
                    selectedImage === index ? "border-(--moss)" : "border-(--line)"
                  }`}
                  style={{ backgroundImage: `url("${image}")` }}
                />
              ))}
            </div>
          )}
        </div>

        <section className="flex flex-col items-start py-2 sm:py-8">
          {categoryName && (
            <Link className="text-xs uppercase tracking-[0.12em] text-(--moss) hover:underline" href={`/category/${product.categoryId}`}>
              {categoryName}
            </Link>
          )}
          <h1 className="mt-4 font-serif text-3xl font-normal leading-tight text-(--ink) sm:text-4xl">{product.name}</h1>
          <strong className="mt-4 text-lg font-medium text-(--ink)">
            {hasVariants && !selectedVariant ? "Select options for price" : priceLabel}
          </strong>

          {attributes.map((attribute, attributeIndex) => {
            const available = availableValues(attributeIndex, attribute);
            return (
              <fieldset key={attribute.id} className="mt-5">
                <legend className="text-xs font-medium uppercase tracking-wider text-(--muted)">
                  {attribute.name}: <strong className="text-(--ink)">{selectedAttributes[attribute.id] ?? "Choose"}</strong>
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {attribute.values.map((value) => {
                    const disabled = hasVariants && !available.has(value);
                    const selected = selectedAttributes[attribute.id] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={disabled}
                        aria-pressed={selected}
                        onClick={() => selectAttribute(attributeIndex, attribute, value)}
                        className={`rounded border px-3 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected
                            ? "border-(--moss) bg-(--moss) text-white"
                            : "border-(--line) bg-white text-(--ink) hover:border-(--moss)"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          {selectionComplete && stock !== undefined && (
            <p className="mt-4 text-xs text-(--muted)">{stock > 0 ? `${stock} in stock` : "Out of stock"}</p>
          )}
          {selectionComplete && sku && <p className="mt-1 text-xs text-(--muted)">SKU: {sku}</p>}

          <p className="mt-6 max-w-prose whitespace-pre-line text-sm leading-7 text-(--muted)">{product.description}</p>

          <button
            type="button"
            className="mt-8 min-h-12 w-full max-w-sm rounded bg-(--moss) px-6 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleAddToCart}
            disabled={(hasVariants && (!selectedVariant || selectedVariant.stock < 1)) || (!hasVariants && product.stock === 0)}
          >
            {stock === 0 ? "Out of stock" : "Add to bag"}
          </button>
          <p role="status" className="mt-3 min-h-5 text-xs text-(--moss)">{added}</p>
        </section>
      </div>
    </main>
  );
}
