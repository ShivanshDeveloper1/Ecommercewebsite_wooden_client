import { getDatabase } from "@/lib/mongodb";
import { databaseUnavailableResponse, parseProduct } from "@/lib/admin-validation";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

type RouteContext = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const product = parseProduct(await request.json().catch(() => null));
  if (!product) return Response.json({ error: "Complete all required product fields with valid prices." }, { status: 400 });

  try {
    const database = await getDatabase();
    const products = database.collection<Product>("products");
    const existing = await products.findOne({ slug });
    if (!existing) return Response.json({ error: "Product not found." }, { status: 404 });
    if (!await database.collection<Category>("categories").findOne({ slug: product.categoryId })) {
      return Response.json({ error: "Select an existing category." }, { status: 400 });
    }
    if (product.slug !== slug && await products.findOne({ slug: product.slug })) {
      return Response.json({ error: "A product with this slug already exists." }, { status: 409 });
    }

    await products.updateOne({ slug }, { $set: product });
    return Response.json({ product: { ...existing, ...product } });
  } catch {
    return databaseUnavailableResponse();
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  try {
    const result = await (await getDatabase()).collection<Product>("products").deleteOne({ slug });
    if (!result.deletedCount) return Response.json({ error: "Product not found." }, { status: 404 });
    return Response.json({ success: true });
  } catch {
    return databaseUnavailableResponse();
  }
}