import CustomerShell from "@/components/CustomerShell";
import ProductBrowser from "@/components/ProductBrowser";
import PageContainer from "@/components/PageContainer";
import { getStoreCategories, getStoreProducts } from "@/lib/store-data";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export const metadata = {
  title: "Shop the collection | Form & Forest",
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category = "", q = "" } = await searchParams;
  const [categories, products] = await Promise.all([
    getStoreCategories(),
    getStoreProducts({ categoryId: category, query: q }),
  ]);

  return (
    <CustomerShell>
      <main className="products-section min-h-[55vh] py-10 sm:py-14">
        <PageContainer>
          <div className="mb-8">
            <p className="eyebrow">GOOD THINGS, MADE WELL</p>
            <h1 className="font-serif text-3xl font-normal text-(--ink) sm:text-4xl">The collection</h1>
            <p className="mt-2 text-sm text-(--muted)">Thoughtful pieces for a more considered home.</p>
          </div>
          <ProductBrowser products={products} categories={categories} query={q} selectedCategory={category} />
        </PageContainer>
      </main>
    </CustomerShell>
  );
}