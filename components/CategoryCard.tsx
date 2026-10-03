import type { Category } from "@/models/category";
import Link from "next/link";
import Icon from "@/components/Icon";

export default function CategoryCard({ category, index, itemCount }: {
  category: Category;
  index: number;
  itemCount: number;
}) {
  return (
    <Link className="category-card" href={`/category/${category.slug}`} aria-label={`${category.name}: ${category.description}`}>
      <div className="category-image" role="img" aria-label={`${category.name} in natural wood`} style={{ backgroundImage: `url("${category.image}")` }}>
        <span className="category-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="round-arrow"><Icon name="arrow" /></span>
      </div>
      <div className="category-meta"><h3>{category.name}</h3><span>{String(itemCount).padStart(2, "0")} pieces</span></div>
    </Link>
  );
}
