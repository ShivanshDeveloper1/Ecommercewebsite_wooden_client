import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ error: "Order ID is required." }, { status: 400 });
    }

    const database = await getDatabase();
    const order = await database.collection("orders").findOne({ _id: new ObjectId(id) });
    if (!order) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    const { _id, ...rest } = order;
    return Response.json({ _id: _id.toString(), ...rest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load order.";
    return Response.json({ error: message }, { status: 400 });
  }
}
