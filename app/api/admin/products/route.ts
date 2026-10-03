import { getDatabase } from "@/lib/mongodb";
import { databaseUnavailableResponse, parseProduct } from "@/lib/admin-validation";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

export async function GET() {
  try {
    const products = await (await getDatabase()).collection<Product>("products")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return Response.json({ products });
  } catch {
    return databaseUnavailableResponse();
  }
}

export async function POST(request: Request) {
  const product = parseProduct(await request.json().catch(() => null));
  if (!product) return Response.json({ error: "Complete all required product fields with valid prices." }, { status: 400 });

  try {
    const database = await getDatabase();
    if (!await database.collection<Category>("categories").findOne({ slug: product.categoryId })) {
      return Response.json({ error: "Select an existing category." }, { status: 400 });
    }
    const collection = database.collection<Product>("products");
    if (await collection.findOne({ slug: product.slug })) {
      return Response.json({ error: "A product with this slug already exists." }, { status: 409 });
    }
    const saved = { ...product, createdAt: new Date() };
    await collection.insertOne(saved);
    return Response.json({ product: saved }, { status: 201 });
  } catch {
    return databaseUnavailableResponse();
  }
}