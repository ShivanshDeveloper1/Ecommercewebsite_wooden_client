export interface Product {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  images: string[];
  categoryId: string;
  featured: boolean;
  createdAt: Date;
}
