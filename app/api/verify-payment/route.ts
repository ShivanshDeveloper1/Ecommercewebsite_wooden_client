import { getDatabase } from "@/lib/mongodb";
import { razorpay, verifyRazorpaySignature } from "@/lib/checkout";
import type { Order } from "@/models/order";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const razorpayOrderId = typeof body?.razorpay_order_id === "string" ? body.razorpay_order_id : "";
    const razorpayPaymentId = typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
    const razorpaySignature = typeof body?.razorpay_signature === "string" ? body.razorpay_signature : "";

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return Response.json({ success: false, error: "Missing payment verification payload." }, { status: 400 });
    }

    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return Response.json({ success: false, error: "Invalid Razorpay signature." }, { status: 400 });
    }

    const database = await getDatabase();
    const collection = database.collection<Order>("orders");
    const existingOrder = await collection.findOne({ razorpayPaymentId });
    if (existingOrder?.paymentStatus === "PAID") {
      return Response.json({ success: true, orderId: existingOrder._id?.toString(), orderNumber: existingOrder.orderNumber });
    }

    const orderRecord = await collection.findOne({ razorpayOrderId });
    if (!orderRecord) {
      return Response.json({ success: false, error: "Order not found for this Razorpay payment." }, { status: 404 });
    }

    const [orderDetails, paymentDetails] = await Promise.all([
      razorpay.orders.fetch(razorpayOrderId).catch(() => null),
      razorpay.payments.fetch(razorpayPaymentId).catch(() => null),
    ]);

    if (!orderDetails || !paymentDetails) {
      return Response.json({ success: false, error: "Unable to verify the Razorpay order or payment." }, { status: 400 });
    }

    if (Number(orderDetails.amount) !== Math.round(Number(orderRecord.total) * 100)) {
      return Response.json({ success: false, error: "Razorpay amount does not match the order total." }, { status: 400 });
    }

    const paymentStatus = paymentDetails.status;
    const successfulStatuses = ["captured", "authorized"] as const;
    if (!successfulStatuses.includes(paymentStatus as (typeof successfulStatuses)[number])) {
      await collection.updateOne(
        { _id: orderRecord._id },
        { $set: { paymentStatus: "FAILED", updatedAt: new Date() } },
      );
      return Response.json({ success: false, error: "Payment was not successful." }, { status: 400 });
    }

    const updatedOrder = await collection.findOneAndUpdate(
      { _id: orderRecord._id, paymentStatus: { $ne: "PAID" } },
      {
        $set: {
          razorpayPaymentId,
          razorpaySignature,
          paymentStatus: "PAID",
          orderStatus: "CONFIRMED",
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    const finalOrder = updatedOrder ?? orderRecord;
    return Response.json({
      success: true,
      orderId: finalOrder._id?.toString(),
      orderNumber: finalOrder.orderNumber,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment.";
    return Response.json({ success: false, error: message }, { status: 400 });
  }
}
