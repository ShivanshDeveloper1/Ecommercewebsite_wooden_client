import { notFound } from "next/navigation";
import CustomerShell from "@/components/CustomerShell";
import PageContainer from "@/components/PageContainer";
import ProductBrowser from "@/components/ProductBrowser";
import { getStoreCategories, getStoreCategory, getStoreProducts } from "@/lib/store-data";

export const dynamic = "force-dynamic";

type CategoryPageProps = { params: Promise<{ slug: string }> };

export const metadata = { title: "Category | OudArs" };

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, categories, products] = await Promise.all([
    getStoreCategory(slug),
    getStoreCategories(),
    getStoreProducts({ categoryId: slug }),
  ]);
  if (!category) notFound();

  return (
    <CustomerShell>
      <main className="min-h-[55vh] py-10 sm:py-14">
        <PageContainer>
          <div className="mb-9 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(240px,0.7fr)] sm:items-center">
            <div>
              <p className="eyebrow">ROOM TO ROOM</p>
              <h1 className="font-serif text-3xl font-normal text-(--ink) sm:text-4xl">{category.name}</h1>
              <p className="mt-3 max-w-prose text-sm leading-6 text-(--muted)">{category.description}</p>
            </div>
            {category.image && <div className="aspect-[1.7] bg-[#dedbd1] bg-cover bg-center sm:aspect-[1.5]" style={{ backgroundImage: `url("${category.image}")` }} role="img" aria-label={category.name} />}
          </div>
          <ProductBrowser products={products} categories={categories} selectedCategory={slug} />
        </PageContainer>
      </main>
    </CustomerShell>
  );
}