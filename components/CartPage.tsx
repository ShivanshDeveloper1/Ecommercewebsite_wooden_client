"use client";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCartItemKey, useCart } from "@/components/CartProvider";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

type CheckoutCustomer = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
};

const emptyCustomer: CheckoutCustomer = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
};

export default function CartPage() {
  const { items, subtotal, hydrated, updateQuantity, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<CheckoutCustomer>(emptyCustomer);
  const router = useRouter();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCustomerChange = (field: keyof CheckoutCustomer, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  const handleCheckout = async () => {
    const missingCustomerField = Object.values(customer).some((value) => value.trim().length === 0);
    if (missingCustomerField) {
      alert("Please complete the shipping details before placing the order.");
      return;
    }

    setLoading(true);
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer }),
      });
      const orderData = await res.json();

      if (!res.ok) throw new Error(orderData.error || "Checkout could not be initialized.");

      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) {
        throw new Error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID in the environment.");
      }

      const options = {
        key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "OudArs",
        description: "Purchase Payment",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            clearCart();
            router.push(`/success?orderId=${verifyData.orderId}`);
          } else {
            alert(verifyData.error || "Payment verification failed!");
          }
        },
        theme: { color: "#2d3a29" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Checkout initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return <main className="section-wrap min-h-[45vh] py-16 text-sm text-(--muted)">Loading your bag…</main>;

  return (
    <main className="section-wrap min-h-[45vh] py-10 sm:py-16">
      <h1 className="font-serif text-3xl font-normal text-(--ink)">Your bag</h1>
      {items.length === 0 ? (
        <div className="mt-8 border-y border-(--line) py-12 text-center">
          <p className="text-sm text-(--muted)">Your bag is empty.</p>
          <Link href="/products" className="mt-5 inline-flex rounded bg-(--moss) px-5 py-3 text-sm text-[#ffffff] hover:opacity-90">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <ul className="divide-y divide-(--line) border-y border-(--line)">
            {items.map((item) => (
              <li key={getCartItemKey(item)} className="flex gap-4 py-5 sm:gap-6">
                <Link href={`/products/${item.slug}`} className="h-24 w-24 shrink-0 bg-[#dedbd1] bg-cover bg-center sm:h-32 sm:w-32" style={item.images[0] ? { backgroundImage: `url("${item.images[0]}")` } : undefined} aria-label={`View ${item.name}`} />
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-serif text-lg hover:text-(--moss)">{item.name}</Link>
                    {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                      <dl className="mt-1 space-y-0.5 text-xs text-(--muted)">
                        {Object.entries(item.selectedAttributes).map(([name, value]) => (
                          <div key={name}><dt className="inline">{name}: </dt><dd className="inline">{value}</dd></div>
                        ))}
                      </dl>
                    )}
                    {item.sku && <p className="mt-1 text-xs text-(--muted)">SKU: {item.sku}</p>}
                    <p className="mt-1 text-sm text-(--muted)">{currency.format(item.salePrice ?? item.price)}</p>
                    {item.stock !== undefined && <p className="mt-1 text-xs text-(--muted)">{item.stock} in stock</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="sr-only" htmlFor={`quantity-${getCartItemKey(item)}`}>Quantity for {item.name}</label>
                    <input id={`quantity-${getCartItemKey(item)}`} type="number" min="1" max={item.stock ?? 99} value={item.quantity} onChange={(event) => updateQuantity(getCartItemKey(item), Number(event.target.value))} className="w-16 rounded border border-(--line) px-2 py-2 text-center text-sm" />
                    <button type="button" onClick={() => removeItem(getCartItemKey(item))} className="text-xs text-(--muted) underline hover:text-red-700">Remove</button>
                  </div>
                  <strong className="min-w-20 text-right text-sm font-medium">{currency.format((item.salePrice ?? item.price) * item.quantity)}</strong>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded border border-(--line) bg-white p-5">
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-(--ink)">Customer details</h2>
              <label className="block text-xs font-medium text-(--muted)">
                Full name
                <input value={customer.fullName} onChange={(event) => handleCustomerChange("fullName", event.target.value)} className="mt-1 w-full rounded border border-(--line) bg-white px-3 py-2.5 text-sm text-(--ink) outline-none focus:border-(--moss)" required />
              </label>
              <label className="block text-xs font-medium text-(--muted)">
                Email
                <input type="email" value={customer.email} onChange={(event) => handleCustomerChange("email", event.target.value)} className="mt-1 w-full rounded border border-(--line) bg-white px-3 py-2.5 text-sm text-(--ink) outline-none focus:border-(--moss)" required />
              </label>
              <label className="block text-xs font-medium text-(--muted)">
                Phone
                <input type="tel" value={customer.phone} onChange={(event) => handleCustomerChange("phone", event.target.value)} className="mt-1 w-full rounded border border-(--line) bg-white px-3 py-2.5 text-sm text-(--ink) outline-none focus:border-(--moss)" required />
              </label>
              <label className="block text-xs font-medium text-(--muted)">
                Address
                <input value={customer.address} onChange={(event) => handleCustomerChange("address", event.target.value)} className="mt-1 w-full rounded border border-(--line) bg-white px-3 py-2.5 text-sm text-(--ink) outline-none focus:border-(--moss)" required />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium text-(--muted)">
                  City
                  <input value={customer.city} onChange={(event) => handleCustomerChange("city", event.target.value)} className="mt-1 w-full rounded border border-(--line) bg-white px-3 py-2.5 text-sm text-(--ink) outline-none focus:border-(--moss)" required />
                </label>
                <label className="block text-xs font-medium text-(--muted)">
                  State
                  <input value={customer.state} onChange={(event) => handleCustomerChange("state", event.target.value)} className="mt-1 w-full rounded border border-(--line) bg-white px-3 py-2.5 text-sm text-(--ink) outline-none focus:border-(--moss)" required />
                </label>
              </div>
              <label className="block text-xs font-medium text-(--muted)">
                Postal code
                <input value={customer.postalCode} onChange={(event) => handleCustomerChange("postalCode", event.target.value)} className="mt-1 w-full rounded border border-(--line) bg-white px-3 py-2.5 text-sm text-(--ink) outline-none focus:border-(--moss)" required />
              </label>
            </div>
            <div className="mt-5 flex justify-between text-sm"><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
            <p className="mt-3 text-xs leading-5 text-(--muted)">Shipping and taxes are calculated at checkout.</p>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="mt-5 block w-full rounded bg-(--moss) px-4 py-3 text-center text-sm font-medium !text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Proceed to Checkout"}
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}