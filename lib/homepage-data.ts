import { categories as sampleCategories, categoryCounts as sampleCategoryCounts, products as sampleProducts } from "@/data/homepage";
import { getDatabase } from "@/lib/mongodb";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

export async function getHomepageData() {
  if (!process.env.MONGODB_URI) {
    return {
      categories: sampleCategories,
      products: sampleProducts.filter((product) => product.featured),
      categoryCounts: sampleCategoryCounts,
    };
  }

  const database = await getDatabase();
  const [categories, products] = await Promise.all([
    database.collection<Category>("categories").find({}, { projection: { _id: 0 } }).toArray(),
    database.collection<Product>("products").find({}, { projection: { _id: 0 } }).toArray(),
  ]);

  const categoryCounts = products.reduce<Record<string, number>>((counts, product) => {
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    return counts;
  }, {});

  return {
    categories,
    products: products.filter((product) => product.featured),
    categoryCounts,
  };
}
