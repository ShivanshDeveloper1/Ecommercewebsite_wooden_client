import type { Category } from "@/models/category";
import type { Product, ProductAttribute, ProductVariant } from "@/models/product";

type CategoryInput = Omit<Category, "createdAt">;
type ProductInput = Omit<Product, "createdAt">;

export type ProductSkuRecord = Pick<Product, "slug" | "sku" | "variants">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") return Number.NaN;
  if (typeof value === "string" && value.trim() === "") return Number.NaN;
  return Number(value);
}

function parseStringList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const result = value.map(text);
  if (result.some((item) => !item)) return null;
  const unique = new Set(result.map((item) => item.toLocaleLowerCase()));
  return unique.size === result.length ? result : null;
}

function parseAttributes(value: unknown): ProductAttribute[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 100) return null;

  const attributes: ProductAttribute[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();

  for (const item of value) {
    if (!isRecord(item)) return null;
    const id = text(item.id);
    const name = text(item.name);
    const values = parseStringList(item.values);
    if (
      !/^[A-Za-z0-9_-]{1,100}$/.test(id) ||
      id === "__proto__" ||
      id === "constructor" ||
      id === "prototype" ||
      !name ||
      name.length > 100 ||
      !values ||
      values.length === 0 ||
      values.length > 100
    ) return null;

    const normalizedName = name.toLocaleLowerCase();
    if (ids.has(id) || names.has(normalizedName)) return null;
    ids.add(id);
    names.add(normalizedName);
    attributes.push({ id, name, values });
  }

  return attributes;
}

function parseVariants(
  value: unknown,
  attributes: ProductAttribute[],
): ProductVariant[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 1000) return null;
  if (value.length > 0 && attributes.length === 0) return null;

  const variantIds = new Set<string>();
  const skus = new Set<string>();
  const combinations = new Set<string>();
  const variants: ProductVariant[] = [];

  for (const item of value) {
    if (!isRecord(item) || !isRecord(item.attributes)) return null;
    const variantId = text(item.variantId);
    const sku = text(item.sku);
    const price = numberValue(item.price);
    const stock = numberValue(item.stock);
    const salePrice = item.salePrice === undefined || item.salePrice === null || item.salePrice === ""
      ? null
      : numberValue(item.salePrice);
    const images = item.images === undefined ? undefined : parseStringList(item.images);
    const optionEntries = Object.entries(item.attributes);
    const variantAttributes: Record<string, string> = {};

    for (const [key, selected] of optionEntries) {
      const attribute = attributes.find((itemAttribute) => itemAttribute.id === key);
      if (!attribute || typeof selected !== "string" || !attribute.values.includes(selected)) return null;
      variantAttributes[key] = selected;
    }

    if (
      !/^[A-Za-z0-9_-]{1,100}$/.test(variantId) ||
      !sku ||
      sku.length > 100 ||
      !Number.isFinite(price) ||
      price < 0 ||
      (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      optionEntries.length !== attributes.length ||
      (item.images !== undefined && !images)
    ) return null;

    const normalizedSku = sku.toLowerCase();
    const combinationKey = JSON.stringify(Object.entries(variantAttributes).sort(([left], [right]) => left.localeCompare(right)));
    if (
      variantIds.has(variantId) ||
      skus.has(normalizedSku) ||
      combinations.has(combinationKey)
    ) return null;

    variantIds.add(variantId);
    skus.add(normalizedSku);
    combinations.add(combinationKey);
    variants.push({
      variantId,
      attributes: variantAttributes,
      sku,
      price,
      salePrice,
      stock,
      ...(images ? { images } : {}),
    });
  }

  return attributes.length > 0 && variants.length === 0 ? null : variants;
}

export function parseCategory(value: unknown): CategoryInput | null {
  if (!isRecord(value)) return null;

  const name = text(value.name);
  const slug = text(value.slug);
  const description = text(value.description);
  const image = text(value.image);
  if (!name || !slug || !description) return null;

  return { name, slug, description, image };
}

export function parseProduct(value: unknown): ProductInput | null {
  if (!isRecord(value)) return null;

  const name = text(value.name);
  const slug = text(value.slug);
  const description = text(value.description);
  const categoryId = text(value.categoryId);
  const price = numberValue(value.price);
  const salePrice = value.salePrice === null || value.salePrice === ""
    ? null
    : numberValue(value.salePrice);
  const skuInputValid = value.sku === undefined || value.sku === null || typeof value.sku === "string";
  const sku = value.sku === undefined || value.sku === null ? undefined : text(value.sku);
  const stock = value.stock === undefined || value.stock === null || value.stock === ""
    ? undefined
    : numberValue(value.stock);
  const images = Array.isArray(value.images)
    ? value.images.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
    : [];
  const attributes = parseAttributes(value.attributes);
  const variants = attributes ? parseVariants(value.variants, attributes) : null;
  const colors = value.colors === undefined ? undefined : parseStringList(value.colors);
  const sizes = value.sizes === undefined ? undefined : parseStringList(value.sizes);

  if (
    !name || !slug || !description || !categoryId ||
    !Number.isFinite(price) || price < 0 ||
    (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) ||
    typeof value.featured !== "boolean" ||
    !skuInputValid ||
    (sku !== undefined && sku.length > 100) ||
    (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) ||
    !attributes ||
    !variants ||
    (value.colors !== undefined && !colors) ||
    (value.sizes !== undefined && !sizes) ||
    (sku && variants.some((variant) => variant.sku.toLowerCase() === sku.toLowerCase()))
  ) return null;

  return {
    name,
    slug,
    description,
    price,
    salePrice,
    ...(sku ? { sku } : {}),
    ...(stock !== undefined ? { stock } : {}),
    images,
    categoryId,
    featured: value.featured,
    attributes,
    variants,
    ...(colors ? { colors } : {}),
    ...(sizes ? { sizes } : {}),
  };
}

export function findDuplicateProductSku(
  existingProducts: ProductSkuRecord[],
  product: ProductInput,
  excludedSlug?: string,
) {
  const requestedSkus = [
    ...(product.sku ? [product.sku] : []),
    ...(product.variants ?? []).map((variant) => variant.sku),
  ].map((sku) => sku.toLowerCase());

  if (new Set(requestedSkus).size !== requestedSkus.length) return true;

  return existingProducts.some((existing) => {
    if (existing.slug === excludedSlug) return false;
    const existingSkus = [
      ...(existing.sku ? [existing.sku] : []),
      ...(existing.variants ?? []).map((variant) => variant.sku),
    ].filter((sku): sku is string => typeof sku === "string");
    return existingSkus.some((sku) => requestedSkus.includes(sku.toLowerCase()));
  });
}

export function databaseUnavailableResponse() {
  const message = process.env.MONGODB_URI
    ? "Unable to connect to MongoDB. Check the database configuration and try again."
    : "MONGODB_URI is not configured.";
  return Response.json({ error: message }, { status: 503 });
}