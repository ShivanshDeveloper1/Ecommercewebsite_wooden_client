import { getDatabase } from "@/lib/mongodb";
import { createPendingOrderRecord, createRazorpayOrder, normalizeCustomerInput, resolveCheckoutItems } from "@/lib/checkout";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const customer = normalizeCustomerInput(body?.customer ?? body);
    const { orderItems, subtotal, total } = await resolveCheckoutItems(body?.items);

    const razorpayOrder = await createRazorpayOrder(total, customer.fullName);
    const pendingOrder = await createPendingOrderRecord(customer, orderItems, subtotal, total, razorpayOrder.id);
    const database = await getDatabase();
    await database.collection("orders").updateOne(
      { _id: pendingOrder._id },
      {
        $set: {
          orderNumber: pendingOrder.orderNumber,
          customer,
          items: orderItems,
          subtotal,
          total,
          updatedAt: new Date(),
        },
      },
    );

    return Response.json({
      success: true,
      orderId: pendingOrder._id.toString(),
      orderNumber: pendingOrder.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
      console.error("CHECKOUT ERROR:", error);

  return Response.json(
    {
      error: error instanceof Error ? error.message : String(error),
    },
    { status: 400 }
  );

    const message = error instanceof Error ? error.message : "Unable to create checkout order.";
    return Response.json({ error: message }, { status: 400 });
  }
}
