import { getDatabase } from "@/lib/mongodb";
import { categories as sampleCategories, products as sampleProducts } from "@/data/homepage";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";
import type { Filter } from "mongodb";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getStoreCategories() {
  if (!process.env.MONGODB_URI) return sampleCategories;
  const database = await getDatabase();
  return database.collection<Category>("categories")
    .find({}, { projection: { _id: 0 } })
    .sort({ name: 1 })
    .toArray();
}

export async function getStoreProducts(options: { categoryId?: string; query?: string } = {}) {
  if (!process.env.MONGODB_URI) {
    const query = options.query?.trim().toLowerCase();
    return sampleProducts.filter((product) =>
      (!options.categoryId || product.categoryId === options.categoryId) &&
      (!query || product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)),
    );
  }
  const filter: Filter<Product> = {};
  if (options.categoryId) filter.categoryId = options.categoryId;
  const query = options.query?.trim();
  if (query) {
    const expression = new RegExp(escapeRegex(query), "i");
    filter.$or = [{ name: expression }, { description: expression }];
  }

  const database = await getDatabase();
  return database.collection<Product>("products")
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getStoreProduct(slug: string) {
  if (!process.env.MONGODB_URI) return sampleProducts.find((product) => product.slug === slug) ?? null;
  const database = await getDatabase();
  return database.collection<Product>("products")
    .findOne({ slug }, { projection: { _id: 0 } });
}

export async function getStoreCategory(slug: string) {
  if (!process.env.MONGODB_URI) return sampleCategories.find((category) => category.slug === slug) ?? null;
  const database = await getDatabase();
  return database.collection<Category>("categories")
    .findOne({ slug }, { projection: { _id: 0 } });
}