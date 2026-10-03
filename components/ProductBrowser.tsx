import ProductCard from "@/components/ProductCard";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

export default function ProductBrowser({
  products,
  categories,
  query = "",
  selectedCategory = "",
}: {
  products: Product[];
  categories: Category[];
  query?: string;
  selectedCategory?: string;
}) {
  return (
    <>
      <form action="/products" className="mb-8 grid gap-3 rounded border border-(--line) bg-white p-4 sm:grid-cols-[minmax(0,1fr)_240px_auto] sm:items-end">
        <label className="block text-xs font-medium text-(--ink)">
          Search products
          <input name="q" type="search" defaultValue={query} placeholder="Search the collection" className="mt-1 w-full rounded border border-(--line) bg-white px-3 py-2.5 text-sm outline-none focus:border-(--moss)" />
        </label>
        <label className="block text-xs font-medium text-(--ink)">
          Category
          <select name="category" defaultValue={selectedCategory} className="mt-1 w-full rounded border border-(--line) bg-white px-3 py-2.5 text-sm outline-none focus:border-(--moss)">
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <button type="submit" className="rounded bg-(--moss) px-5 py-2.5 text-sm text-white transition hover:opacity-90">Apply filters</button>
      </form>

      {products.length ? (
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
      ) : (
        <p className="rounded border border-(--line) bg-white px-5 py-12 text-center text-sm text-(--muted)">
          No products found. Try another search or category.
        </p>
      )}
    </>
  );
}