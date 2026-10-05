import { getDatabase } from "@/lib/mongodb";
import { databaseUnavailableResponse, findDuplicateProductSku, parseProduct, type ProductSkuRecord } from "@/lib/admin-validation";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

type RouteContext = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const product = parseProduct(body);
  if (!product) {
    return Response.json({
      error: "Check required product fields, attribute values, variant combinations, SKU, price, and stock values.",
    }, { status: 400 });
  }

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
    const existingProducts = await products.find({}, {
      projection: { _id: 0, slug: 1, sku: 1, "variants.sku": 1 },
    }).toArray() as ProductSkuRecord[];
    if (findDuplicateProductSku(existingProducts, product, slug)) {
      return Response.json({ error: "Product and variant SKUs must be unique." }, { status: 409 });
    }

    const unset: Record<string, ""> = {};
    if (typeof body === "object" && body !== null && "sku" in body && !product.sku) unset.sku = "";
    if (typeof body === "object" && body !== null && "stock" in body && product.stock === undefined) unset.stock = "";
    await products.updateOne(
      { slug },
      Object.keys(unset).length > 0 ? { $set: product, $unset: unset } : { $set: product },
    );
    const updatedProduct = { ...existing, ...product };
    if (unset.sku) delete updatedProduct.sku;
    if (unset.stock) delete updatedProduct.stock;
    return Response.json({ product: updatedProduct });
  } catch (error) {
    console.error("PUT /api/admin/products/[slug] MongoDB error:", error);
    return databaseUnavailableResponse();
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  try {
    const result = await (await getDatabase()).collection<Product>("products").deleteOne({ slug });
    if (!result.deletedCount) return Response.json({ error: "Product not found." }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/products/[slug] MongoDB error:", error);
    return databaseUnavailableResponse();
  }
}