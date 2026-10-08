import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const database = await getDatabase();
    const orders = await database.collection("orders")
      .find({}, { sort: { createdAt: -1 } })
      .toArray();

    const serialized = orders.map((order) => {
      const { _id, ...rest } = order;
      return { _id: _id.toString(), ...rest };
    });

    return Response.json({ orders: serialized });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load orders.";
    return Response.json({ error: message }, { status: 500 });
  }
}
