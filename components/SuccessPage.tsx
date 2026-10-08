"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type OrderItemRecord = {
  productName?: string;
  name?: string;
  quantity?: number | string;
  price?: number | string;
};

type OrderRecord = {
  error?: string;
  items?: OrderItemRecord[];
  _id?: string;
  razorpayPaymentId?: string;
  amount?: number | string;
  status?: string;
  [key: string]: unknown;
};

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);



useEffect(() => {
  if (!orderId) {
    setLoading(false);
    return;
  }

  fetch(`/api/orders/${orderId}`)
    .then((res) => res.json())
    .then((data: OrderRecord) => {
      setOrder(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });
}, [orderId]);

  

  if (loading) return <main className="section-wrap py-16 text-center text-sm">Loading order confirmation…</main>;
  if (!order || order.error) return <main className="section-wrap py-16 text-center text-sm">Order not found.</main>;

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const totalPaid = Number(order.amount ?? 0);

  return (
    <main className="section-wrap py-16">
      <div className="mx-auto max-w-xl rounded border border-(--line) bg-white p-8 text-center">
        <h1 className="font-serif text-2xl font-normal text-green-700">Payment Successful!</h1>
        <p className="mt-2 text-sm text-(--muted)">Thank you for your purchase. Your order has been confirmed.</p>

        <div className="mt-6 border-t border-(--line) pt-4 text-left text-sm space-y-2">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Razorpay Payment ID:</strong> {order.razorpayPaymentId}</p>
          <p><strong>Total Paid:</strong> ${totalPaid.toFixed(2)}</p>
          <p><strong>Status:</strong> <span className="capitalize text-green-600 font-medium">{order.status}</span></p>
        </div>

        <div className="mt-6 border-t border-(--line) pt-4 text-left">
          <h2 className="font-medium text-sm text-(--ink) mb-2">Items Purchased:</h2>
          <ul className="divide-y divide-(--line) text-sm">
            {orderItems.map((item: OrderItemRecord, idx: number) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>{item.productName ?? item.name} (x{item.quantity})</span>
                <span>${((Number(item.price) || 0) * Number(item.quantity || 0)).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/products" className="mt-8 inline-block rounded bg-(--moss) px-6 py-3 text-sm text-white hover:opacity-90">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}