"use client";

import Link from "next/link";
import { getCartItemKey, useCart } from "@/components/CartProvider";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function CartPage() {
  const { items, subtotal, hydrated, updateQuantity, removeItem } = useCart();

  if (!hydrated) return <main className="section-wrap min-h-[45vh] py-16 text-sm text-(--muted)">Loading your bag…</main>;

  return (
    <main className="section-wrap min-h-[45vh] py-10 sm:py-16">
      <h1 className="font-serif text-3xl font-normal text-(--ink)">Your bag</h1>
      {items.length === 0 ? (
        <div className="mt-8 border-y border-(--line) py-12 text-center">
          <p className="text-sm text-(--muted)">Your bag is empty.</p>
          <Link href="/products" className="mt-5 inline-flex rounded bg-(--moss) px-5 py-3 text-sm text-white hover:opacity-90">Explore the collection</Link>
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
                        {Object.entries(item.selectedAttributes).map(([name, value]) => <div key={name}><dt className="inline">{name}: </dt><dd className="inline">{value}</dd></div>)}
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
            <div className="flex justify-between text-sm"><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
            <p className="mt-3 text-xs leading-5 text-(--muted)">Shipping and taxes are calculated at checkout.</p>
            <Link href="/products" className="mt-5 block rounded bg-(--moss) px-4 py-3 text-center text-sm text-white hover:opacity-90">Continue shopping</Link>
          </aside>
        </div>
      )}
    </main>
  );
}