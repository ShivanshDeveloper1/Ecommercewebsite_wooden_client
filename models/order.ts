export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type OrderStatus = "PROCESSING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku?: string | null;
  variantId?: string | null;
  selectedAttributes?: Record<string, string>;
  quantity: number;
  price: number;
  image?: string | null;
}

export interface Order {
  _id?: { toString(): string };
  orderNumber: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date | null;
}
