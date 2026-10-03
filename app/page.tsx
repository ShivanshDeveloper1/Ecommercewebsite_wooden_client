import HomePage from "@/components/HomePage";
import { getHomepageData } from "@/lib/homepage-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { categories, products, categoryCounts } = await getHomepageData();

  return (
    <HomePage
      categories={categories}
      products={products}
      categoryCounts={categoryCounts}
    />
  );
}
