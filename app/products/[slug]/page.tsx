import { notFound } from "next/navigation";
import CustomerShell from "@/components/CustomerShell";
import ProductDetail from "@/components/ProductDetail";
import { getStoreCategories, getStoreProduct } from "@/lib/store-data";

export const dynamic = "force-dynamic";

type ProductPageProps = { params: Promise<{ slug: string }> };

export const metadata = { title: "Product | Form & Forest" };

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    getStoreProduct(slug),
    getStoreCategories(),
  ]);
  if (!product) notFound();

  const category = categories.find((item) => item.slug === product.categoryId);
  return (
    <CustomerShell>
      <ProductDetail key={product.slug} product={product} categoryName={category?.name ?? null} />
    </CustomerShell>
  );
}