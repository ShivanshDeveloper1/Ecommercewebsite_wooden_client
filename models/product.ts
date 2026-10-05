export interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  variantId: string;
  attributes: Record<string, string>;
  sku: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  images?: string[];
}

export interface Product {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  sku?: string;
  stock?: number;
  images: string[];
  categoryId: string;
  featured: boolean;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  colors?: string[]; // e.g., ["Red", "Blue", "Black"]
  sizes?: string[];  // e.g., ["S", "M", "L", "XL"]
  createdAt: Date;
}