import { getDatabase } from "@/lib/mongodb";
import { databaseUnavailableResponse, parseCategory } from "@/lib/admin-validation";
import type { Category } from "@/models/category";

export async function GET() {
  try {
    const database = await getDatabase();
    const categories = await database.collection<Category>("categories")
      .find({}, { projection: { _id: 0 } })
      .sort({ name: 1 })
      .toArray();
    return Response.json({ categories });
  } catch (error) {
    console.error("GET /api/categories MongoDB error:", error);
    return databaseUnavailableResponse();
  }
}

export async function POST(request: Request) {
  const category = parseCategory(await request.json().catch(() => null));
  if (!category) return Response.json({ error: "Enter a name, slug, and description." }, { status: 400 });

  try {
    const collection = (await getDatabase()).collection<Category>("categories");
    if (await collection.findOne({ slug: category.slug })) {
      return Response.json({ error: "A category with this slug already exists." }, { status: 409 });
    }
    const saved = { ...category, createdAt: new Date() };
    await collection.insertOne(saved);
    return Response.json({ category: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories MongoDB error:", error);
    return databaseUnavailableResponse();
  }
}