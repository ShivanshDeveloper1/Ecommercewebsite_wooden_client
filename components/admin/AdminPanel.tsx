"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

type ProductRow = Product & { label?: string };
type AdminTab = "products" | "categories";
type Notice = { type: "success" | "error"; message: string };
type CategoryDraft = { name: string; slug: string; description: string; image: string };
type ProductDraft = {
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  categoryId: string;
  images: string[];
  featured: boolean;
};
type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

const emptyCategory: CategoryDraft = { name: "", slug: "", description: "", image: "" };
const emptyProduct: ProductDraft = {
  name: "",
  slug: "",
  description: "",
  price: "",
  salePrice: "",
  categoryId: "",
  images: [],
  featured: false,
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result as T;
}

async function loadRecords() {
  const [categoryResult, productResult] = await Promise.all([
    request<{ categories: Category[] }>("/api/admin/categories"),
    request<{ products: ProductRow[] }>("/api/admin/products"),
  ]);
  return { categories: categoryResult.categories, products: productResult.products };
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function fieldClass() {
  return "mt-1 w-full rounded border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--moss)] focus:ring-2 focus:ring-[var(--moss)]/15";
}

function slugFromName(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("products");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategory);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft>(emptyProduct);
  const [productSlug, setProductSlug] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadRecords()
      .then((records) => {
        if (!active) return;
        setCategories(records.categories);
        setProducts(records.products);
      })
      .catch((error: unknown) => {
        if (active) setNotice({ type: "error", message: error instanceof Error ? error.message : "Unable to load store data." });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function refreshRecords() {
    const records = await loadRecords();
    setCategories(records.categories);
    setProducts(records.products);
  }

  function editCategory(category: Category) {
    setNotice(null);
    setCategorySlug(category.slug);
    setCategoryDraft({ name: category.name, slug: category.slug, description: category.description, image: category.image });
    setTab("categories");
  }

  function editProduct(product: ProductRow) {
    setNotice(null);
    setProductSlug(product.slug);
    setProductDraft({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      salePrice: product.salePrice === null ? "" : String(product.salePrice),
      categoryId: product.categoryId,
      images: product.images ?? [],
      featured: product.featured,
    });
    setTab("products");
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await request(`/api/admin/categories${categorySlug ? `/${encodeURIComponent(categorySlug)}` : ""}`, {
        method: categorySlug ? "PUT" : "POST",
        body: JSON.stringify(categoryDraft),
      });
      await refreshRecords();
      setCategorySlug(null);
      setCategoryDraft(emptyCategory);
      setNotice({ type: "success", message: categorySlug ? "Category updated." : "Category added." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Unable to save category." });
    } finally {
      setSaving(false);
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await request(`/api/admin/products${productSlug ? `/${encodeURIComponent(productSlug)}` : ""}`, {
        method: productSlug ? "PUT" : "POST",
        body: JSON.stringify({
          ...productDraft,
          price: Number(productDraft.price),
          salePrice: productDraft.salePrice === "" ? null : Number(productDraft.salePrice),
        }),
      });
      await refreshRecords();
      setProductSlug(null);
      setProductDraft(emptyProduct);
      setNotice({ type: "success", message: productSlug ? "Product updated." : "Product added." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Unable to save product." });
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Delete “${category.name}”?`)) return;
    setNotice(null);
    try {
      await request(`/api/admin/categories/${encodeURIComponent(category.slug)}`, { method: "DELETE" });
      await refreshRecords();
      setNotice({ type: "success", message: "Category deleted." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Unable to delete category." });
    }
  }

  async function deleteProduct(product: ProductRow) {
    if (!window.confirm(`Delete “${product.name}”?`)) return;
    setNotice(null);
    try {
      await request(`/api/admin/products/${encodeURIComponent(product.slug)}`, { method: "DELETE" });
      await refreshRecords();
      setNotice({ type: "success", message: "Product deleted." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Unable to delete product." });
    }
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    const selectedFiles = Array.from(files);
    setUploading(true);
    setNotice(null);
    try {
      const upload = await request<UploadSignature>("/api/admin/uploads/signature", { method: "POST" });
      const urls = await Promise.all(selectedFiles.map(async (file) => {
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", upload.apiKey);
        body.append("timestamp", String(upload.timestamp));
        body.append("folder", upload.folder);
        body.append("signature", upload.signature);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${upload.cloudName}/image/upload`, {
          method: "POST",
          body,
        });
        const result = await response.json();
        if (!response.ok || typeof result.secure_url !== "string") {
          throw new Error(result.error?.message || "An image could not be uploaded.");
        }
        return result.secure_url as string;
      }));
      setProductDraft((draft) => ({ ...draft, images: [...draft.images, ...urls] }));
      setNotice({ type: "success", message: `${urls.length} image${urls.length === 1 ? "" : "s"} uploaded.` });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2f1eb] py-8 text-(--ink) sm:py-12">
      <PageContainer className="max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-(--line) pb-6">
          <div>
            <Link href="/" className="text-xs text-(--muted) transition hover:text-(--moss)">← Back to storefront</Link>
            <h1 className="mt-3 font-serif text-3xl font-normal">Store admin</h1>
            <p className="mt-1 text-sm text-(--muted)">Manage your catalog and product imagery.</p>
          </div>
          <span className="rounded border border-(--line) bg-white px-3 py-2 text-xs text-(--muted)">{products.length} products · {categories.length} categories</span>
        </div>

        {notice && <div role={notice.type === "error" ? "alert" : "status"} className={`mb-5 rounded border px-4 py-3 text-sm ${notice.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{notice.message}</div>}

        <div className="mb-6 flex gap-2 border-b border-(--line)" role="tablist" aria-label="Catalog sections">
          {(["products", "categories"] as const).map((section) => (
            <button key={section} type="button" role="tab" aria-selected={tab === section} onClick={() => { setTab(section); setNotice(null); }} className={`border-b-2 px-4 py-3 text-sm capitalize transition ${tab === section ? "border-(--moss) font-medium text-(--moss)" : "border-transparent text-(--muted) hover:text-(--ink)"}`}>
              {section} <span className="ml-1 text-xs opacity-70">{section === "products" ? products.length : categories.length}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-(--muted)">Loading catalog…</p>
        ) : tab === "categories" ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="overflow-hidden rounded border border-(--line) bg-white">
              <div className="border-b border-(--line) px-5 py-4"><h2 className="text-sm font-medium">Categories</h2></div>
              {categories.length === 0 ? <p className="px-5 py-10 text-sm text-(--muted)">No categories yet. Add one to start organizing products.</p> : (
                <ul className="divide-y divide-(--line)">
                  {categories.map((category) => (
                    <li key={category.slug} className="flex items-center gap-4 px-5 py-4">
                      <div className="h-14 w-14 shrink-0 rounded border border-(--line) bg-cover bg-center bg-background" style={category.image ? { backgroundImage: `url("${category.image}")` } : undefined} aria-label={`${category.name} image`} role="img" />
                      <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-medium">{category.name}</h3><p className="mt-1 truncate text-xs text-(--muted)">/{category.slug} · {category.description}</p></div>
                      <div className="flex shrink-0 gap-3 text-xs"><button type="button" className="text-(--moss) hover:underline" onClick={() => editCategory(category)}>Edit</button><button type="button" className="text-red-700 hover:underline" onClick={() => deleteCategory(category)}>Delete</button></div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <form onSubmit={saveCategory} className="space-y-4 rounded border border-(--line) bg-white p-5">
              <div className="flex items-center justify-between"><h2 className="text-sm font-medium">{categorySlug ? "Edit category" : "Add category"}</h2>{categorySlug && <button type="button" className="text-xs text-(--muted) hover:text-(--ink)" onClick={() => { setCategorySlug(null); setCategoryDraft(emptyCategory); }}>Cancel</button>}</div>
              <label className="block text-xs font-medium">Name<input className={fieldClass()} value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })} required /></label>
              <label className="block text-xs font-medium">Slug<input className={fieldClass()} value={categoryDraft.slug} onChange={(event) => setCategoryDraft({ ...categoryDraft, slug: slugFromName(event.target.value) })} required /></label>
              <label className="block text-xs font-medium">Description<textarea className={fieldClass()} rows={3} value={categoryDraft.description} onChange={(event) => setCategoryDraft({ ...categoryDraft, description: event.target.value })} required /></label>
              <label className="block text-xs font-medium">Image URL <span className="font-normal text-(--muted)">(optional)</span><input className={fieldClass()} type="url" value={categoryDraft.image} onChange={(event) => setCategoryDraft({ ...categoryDraft, image: event.target.value })} /></label>
              <button type="submit" disabled={saving} className="w-full rounded bg-(--moss) px-4 py-2.5 text-sm text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">{saving ? "Saving…" : categorySlug ? "Save category" : "Add category"}</button>
            </form>
          </div>
        ) : (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
            <section className="overflow-hidden rounded border border-(--line) bg-white">
              <div className="border-b border-(--line) px-5 py-4"><h2 className="text-sm font-medium">Products</h2></div>
              {products.length === 0 ? <p className="px-5 py-10 text-sm text-(--muted)">No products yet. Add your first product using the form.</p> : (
                <ul className="divide-y divide-(--line)">
                  {products.map((product) => {
                    const category = categories.find((item) => item.slug === product.categoryId);
                    return (
                      <li key={product.slug} className="flex items-center gap-4 px-5 py-4">
                        <div className="h-14 w-14 shrink-0 rounded border border-(--line) bg-cover bg-center bg-background" style={product.images[0] ? { backgroundImage: `url("${product.images[0]}")` } : undefined} role="img" aria-label={`${product.name} image`} />
                        <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-medium">{product.name}</h3><p className="mt-1 truncate text-xs text-(--muted)">{category?.name ?? "Category missing"} · {money(product.salePrice ?? product.price)}{product.featured ? " · Featured" : ""}</p></div>
                        <div className="flex shrink-0 gap-3 text-xs"><button type="button" className="text-(--moss) hover:underline" onClick={() => editProduct(product)}>Edit</button><button type="button" className="text-red-700 hover:underline" onClick={() => deleteProduct(product)}>Delete</button></div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <form onSubmit={saveProduct} className="space-y-4 rounded border border-(--line) bg-white p-5">
              <div className="flex items-center justify-between"><h2 className="text-sm font-medium">{productSlug ? "Edit product" : "Add product"}</h2>{productSlug && <button type="button" className="text-xs text-(--muted) hover:text-(--ink)" onClick={() => { setProductSlug(null); setProductDraft(emptyProduct); }}>Cancel</button>}</div>
              <label className="block text-xs font-medium">Name<input className={fieldClass()} value={productDraft.name} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })} required /></label>
              <label className="block text-xs font-medium">Slug<input className={fieldClass()} value={productDraft.slug} onChange={(event) => setProductDraft({ ...productDraft, slug: slugFromName(event.target.value) })} required /></label>
              <label className="block text-xs font-medium">Description<textarea className={fieldClass()} rows={3} value={productDraft.description} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} required /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium">Price<input className={fieldClass()} type="number" min="0" step="0.01" value={productDraft.price} onChange={(event) => setProductDraft({ ...productDraft, price: event.target.value })} required /></label>
                <label className="block text-xs font-medium">Sale price<input className={fieldClass()} type="number" min="0" step="0.01" value={productDraft.salePrice} onChange={(event) => setProductDraft({ ...productDraft, salePrice: event.target.value })} placeholder="Optional" /></label>
              </div>
              <label className="block text-xs font-medium">Category<select className={fieldClass()} value={productDraft.categoryId} onChange={(event) => setProductDraft({ ...productDraft, categoryId: event.target.value })} required><option value="">Select category</option>{categories.map((category) => <option value={category.slug} key={category.slug}>{category.name}</option>)}</select></label>
              <div>
                <label className="block text-xs font-medium">Product images</label>
                <label className={`mt-2 flex cursor-pointer items-center justify-center rounded border border-dashed border-(--line) bg-background px-4 py-4 text-center text-xs text-(--muted) transition hover:border-(--moss) ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                  <input className="sr-only" type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => { void uploadImages(event.currentTarget.files); event.currentTarget.value = ""; }} />
                  {uploading ? "Uploading images…" : "Choose multiple images to upload"}
                </label>
                {productDraft.images.length > 0 && <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{productDraft.images.map((url, index) => <li key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded border border-(--line) bg-cover bg-center" style={{ backgroundImage: `url("${url}")` }}><span className="sr-only">Product image {index + 1}</span><button type="button" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded bg-black/70 text-sm text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Remove image ${index + 1}`} onClick={() => setProductDraft((draft) => ({ ...draft, images: draft.images.filter((_, imageIndex) => imageIndex !== index) }))}>×</button></li>)}</ul>}
              </div>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={productDraft.featured} onChange={(event) => setProductDraft({ ...productDraft, featured: event.target.checked })} className="h-4 w-4 accent-(--moss)" />Featured product</label>
              <button type="submit" disabled={saving || uploading || categories.length === 0} className="w-full rounded bg-(--moss) px-4 py-2.5 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving…" : productSlug ? "Save product" : "Add product"}</button>
              {categories.length === 0 && <p className="text-xs text-(--muted)">Add a category before creating products.</p>}
            </form>
          </div>
        )}
      </PageContainer>
    </main>
  );
}