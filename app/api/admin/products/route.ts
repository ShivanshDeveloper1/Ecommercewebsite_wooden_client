import { getDatabase } from "@/lib/mongodb";
import { databaseUnavailableResponse, findDuplicateProductSku, parseProduct, type ProductSkuRecord } from "@/lib/admin-validation";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

export async function GET() {
  try {
    const products = await (await getDatabase()).collection<Product>("products")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return Response.json({ products });
  } catch (error) {
    console.error("GET /api/admin/products MongoDB error:", error);
    return databaseUnavailableResponse();
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const product = parseProduct(body);
  if (!product) {
    return Response.json({
      error: "Check required product fields, attribute values, variant combinations, SKU, price, and stock values.",
    }, { status: 400 });
  }

  try {
    const database = await getDatabase();
    if (!await database.collection<Category>("categories").findOne({ slug: product.categoryId })) {
      return Response.json({ error: "Select an existing category." }, { status: 400 });
    }
    const collection = database.collection<Product>("products");
    if (await collection.findOne({ slug: product.slug })) {
      return Response.json({ error: "A product with this slug already exists." }, { status: 409 });
    }
    const existingProducts = await collection.find({}, {
      projection: { _id: 0, slug: 1, sku: 1, "variants.sku": 1 },
    }).toArray() as ProductSkuRecord[];
    if (findDuplicateProductSku(existingProducts, product)) {
      return Response.json({ error: "Product and variant SKUs must be unique." }, { status: 409 });
    }

    const saved = { ...product, createdAt: new Date() };
    await collection.insertOne(saved);
    return Response.json({ product: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products MongoDB error:", error);
    return databaseUnavailableResponse();
  }
}