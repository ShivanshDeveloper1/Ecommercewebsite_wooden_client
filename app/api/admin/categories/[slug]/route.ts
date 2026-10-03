import { getDatabase } from "@/lib/mongodb";
import { databaseUnavailableResponse, parseCategory } from "@/lib/admin-validation";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

type RouteContext = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const category = parseCategory(await request.json().catch(() => null));
  if (!category) return Response.json({ error: "Enter a name, slug, and description." }, { status: 400 });

  try {
    const database = await getDatabase();
    const categories = database.collection<Category>("categories");
    const existing = await categories.findOne({ slug });
    if (!existing) return Response.json({ error: "Category not found." }, { status: 404 });
    if (category.slug !== slug && await categories.findOne({ slug: category.slug })) {
      return Response.json({ error: "A category with this slug already exists." }, { status: 409 });
    }

    await categories.updateOne({ slug }, { $set: category });
    if (category.slug !== slug) {
      await database.collection<Product>("products").updateMany(
        { categoryId: slug },
        { $set: { categoryId: category.slug } },
      );
    }
    return Response.json({ category: { ...existing, ...category } });
  } catch {
    return databaseUnavailableResponse();
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  try {
    const database = await getDatabase();
    const categories = database.collection<Category>("categories");
    if (!await categories.findOne({ slug })) {
      return Response.json({ error: "Category not found." }, { status: 404 });
    }
    if (await database.collection<Product>("products").countDocuments({ categoryId: slug })) {
      return Response.json({ error: "Move or delete products in this category first." }, { status: 409 });
    }
    await categories.deleteOne({ slug });
    return Response.json({ success: true });
  } catch {
    return databaseUnavailableResponse();
  }
}