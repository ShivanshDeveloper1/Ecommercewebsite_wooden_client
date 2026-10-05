import type { ProductAttribute, ProductVariant } from "@/models/product";

const MAX_GENERATED_VARIANTS = 1000;

export function getVariantCombinationKey(attributes: Record<string, string>) {
  return JSON.stringify(
    Object.entries(attributes)
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function findMatchingVariant(
  variants: ProductVariant[],
  selectedAttributes: Record<string, string>,
) {
  const selectedKeys = Object.keys(selectedAttributes);
  if (selectedKeys.length === 0) return null;

  return variants.find((variant) =>
    selectedKeys.length === Object.keys(variant.attributes).length &&
    selectedKeys.every((key) => variant.attributes[key] === selectedAttributes[key]),
  ) ?? null;
}

export function getAvailableAttributeValues(
  variants: ProductVariant[],
  attributeId: string,
  selectedAttributes: Record<string, string>,
) {
  return new Set(
    variants
      .filter((variant) =>
        variant.stock > 0 &&
        variant.attributes[attributeId] !== undefined &&
        Object.entries(selectedAttributes).every(([key, value]) =>
          key === attributeId || variant.attributes[key] === value,
        ),
      )
      .map((variant) => variant.attributes[attributeId]),
  );
}

export function createVariantId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function makeSku(productName: string, attributes: Record<string, string>, variantId: string) {
  const suffix = `-${variantId.slice(0, 8).toUpperCase()}`;
  const productPart = productName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24) || "PRODUCT";
  const optionPart = Object.values(attributes)
    .map((value) => value.normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 8))
    .filter(Boolean)
    .join("-");

  const prefix = `${productPart}${optionPart ? `-${optionPart}` : ""}`;
  return `${prefix.slice(0, 100 - suffix.length)}${suffix}`;
}

export function generateVariantCombinations(
  attributes: ProductAttribute[],
  existingVariants: ProductVariant[],
  productName: string,
  defaultPrice: number,
  defaultStock = 0,
): ProductVariant[] {
  if (attributes.length === 0) return [];
  const normalizedAttributes = attributes.map((attribute) => ({
    ...attribute,
    name: attribute.name.trim(),
    values: attribute.values.map((value) => value.trim()),
  }));
  if (normalizedAttributes.some((attribute) =>
    !attribute.name ||
    attribute.values.length === 0 ||
    attribute.values.some((value) => !value) ||
    new Set(attribute.values.map((value) => value.toLocaleLowerCase())).size !== attribute.values.length,
  )) {
    throw new Error("Add at least one option value for every attribute before generating variants.");
  }

  const combinationCount = normalizedAttributes.reduce((total, attribute) => total * attribute.values.length, 1);
  if (!Number.isSafeInteger(combinationCount) || combinationCount > MAX_GENERATED_VARIANTS) {
    throw new Error(`This creates more than ${MAX_GENERATED_VARIANTS} combinations. Reduce the number of options before generating variants.`);
  }

  const existingByCombination = new Map(
    existingVariants.map((variant) => [
      getVariantCombinationKey(variant.attributes),
      variant,
    ]),
  );
  const combinations: Record<string, string>[] = [];

  function buildCombinations(index: number, selected: Record<string, string>) {
    if (index === normalizedAttributes.length) {
      combinations.push(selected);
      return;
    }

    const attribute = normalizedAttributes[index];
    for (const value of attribute.values) {
      buildCombinations(index + 1, { ...selected, [attribute.id]: value });
    }
  }

  buildCombinations(0, {});

  return combinations.map((options) => {
    const existing = existingByCombination.get(getVariantCombinationKey(options));
    if (existing) return existing;

    const variantId = createVariantId();
    return {
      variantId,
      attributes: options,
      sku: makeSku(productName, options, variantId),
      price: defaultPrice,
      stock: defaultStock,
    };
  });
}
