import type { Category } from "@/models/category";
import type { Product } from "@/models/product";

const createdAt = new Date("2026-01-01T00:00:00.000Z");
const image = (photoId: string) => `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=85`;

export const categories: Category[] = [
  { name: "Furniture", slug: "furniture", image: image("photo-1592078615290-033ee584e267"), description: "Furniture shaped from solid wood for everyday living.", createdAt },
  { name: "Home accents", slug: "home-accents", image: image("photo-1600210492486-724fe5c67fb0"), description: "Thoughtful accents that bring warmth to your home.", createdAt },
  { name: "Kitchen & dining", slug: "kitchen-dining", image: image("photo-1603199506016-b9a594b593c0"), description: "Hand-finished pieces made to gather around.", createdAt },
  { name: "Lighting", slug: "lighting", image: image("photo-1507473885765-e6ed057f782c"), description: "Quiet, considered lighting for a softer home.", createdAt },
];

export const categoryCounts: Record<string, number> = {
  furniture: 12,
  "home-accents": 8,
  "kitchen-dining": 14,
  lighting: 6,
};

export const products: (Product & { label?: string })[] = [
  { name: "The Alder Dining Chair", slug: "alder-dining-chair", description: "Solid white oak · Natural oil", price: 480, salePrice: null, images: [image("photo-1598300053653-7ca5a4c9a99f")], categoryId: "furniture", featured: true, createdAt, label: "BESTSELLER" },
  { name: "Low Tide Side Table", slug: "low-tide-side-table", description: "American walnut · Hand-finished", price: 360, salePrice: null, images: [image("photo-1499933374294-4584851497cc")], categoryId: "furniture", featured: true, createdAt },
  { name: "Sunday Serving Board", slug: "sunday-serving-board", description: "Black walnut · Made to gather", price: 86, salePrice: null, images: [image("photo-1603199506016-b9a594b593c0")], categoryId: "kitchen-dining", featured: false, createdAt, label: "MADE TO ORDER" },
  { name: "Arc Table Lamp", slug: "arc-table-lamp", description: "Turned ash · Linen shade", price: 295, salePrice: null, images: [image("photo-1507473885765-e6ed057f782c")], categoryId: "lighting", featured: true, createdAt },
];
