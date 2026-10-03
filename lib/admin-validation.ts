import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

type CategoryInput = Omit<Category, "createdAt">;
type ProductInput = Omit<Product, "createdAt">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
  const price = Number(value.price);
  const salePrice = value.salePrice === null || value.salePrice === ""
    ? null
    : Number(value.salePrice);
  const images = Array.isArray(value.images)
    ? value.images.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
    : [];

  if (
    !name || !slug || !description || !categoryId ||
    !Number.isFinite(price) || price < 0 ||
    (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) ||
    typeof value.featured !== "boolean"
  ) return null;

  return { name, slug, description, price, salePrice, images, categoryId, featured: value.featured };
}

export function databaseUnavailableResponse() {
  const message = process.env.MONGODB_URI
    ? "Unable to connect to MongoDB. Check the database configuration and try again."
    : "MONGODB_URI is not configured.";
  return Response.json({ error: message }, { status: 503 });
}