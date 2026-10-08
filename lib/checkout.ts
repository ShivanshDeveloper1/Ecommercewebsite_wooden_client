import crypto from "crypto";
import Razorpay from "razorpay";
import { getDatabase } from "@/lib/mongodb";
import type { Product, ProductVariant } from "@/models/product";
import type { CustomerDetails, OrderItem } from "@/models/order";

export const RAZORPAY_CURRENCY = "USD";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

function cleanField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeCustomerInput(customer: unknown): CustomerDetails {
  if (!customer || typeof customer !== "object") {
    throw new Error("Customer details are required.");
  }

  const record = customer as Record<string, unknown>;
  const fullName = cleanField(record.fullName ?? record.name);
  const email = cleanField(record.email);
  const phone = cleanField(record.phone);
  const address = cleanField(record.address);
  const city = cleanField(record.city);
  const state = cleanField(record.state);
  const postalCode = cleanField(record.postalCode ?? record.zipCode);

  if (![fullName, email, phone, address, city, state, postalCode].every(Boolean)) {
    throw new Error("Please complete all customer details before checkout.");
  }

  return { fullName, email, phone, address, city, state, postalCode };
}

export function normalizeCartItem(item: unknown): {
  productId: string;
  variantId?: string;
  selectedAttributes: Record<string, string>;
  quantity: number;
} {
  if (!item || typeof item !== "object") {
    throw new Error("Each cart item must be a valid object.");
  }

  const record = item as Record<string, unknown>;
  const productId = cleanField(record.productId ?? record.slug);
  const variantId = typeof record.variantId === "string" ? record.variantId : undefined;
  const selectedAttributes = Object.entries((record.selectedAttributes && typeof record.selectedAttributes === "object" && !Array.isArray(record.selectedAttributes)
    ? record.selectedAttributes
    : {}) as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, value]) => {
      const cleaned = cleanField(value);
      if (cleaned) acc[key] = cleaned;
      return acc;
    }, {});
  const quantity = Number(record.quantity);

  if (!productId) {
    throw new Error("Each cart item must include a valid product ID.");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(`The quantity for "${productId}" must be a positive integer.`);
  }

  return { productId, variantId, selectedAttributes, quantity };
}

function variantMatchesSelection(
  product: Product,
  variant: ProductVariant,
  selectedAttributes: Record<string, string>,
): boolean {
  if (!selectedAttributes || Object.keys(selectedAttributes).length === 0) {
    return true;
  }

  const attributeLookup = new Map<string, string>();
  for (const attribute of product.attributes ?? []) {
    const normalizedName = attribute.name.trim().toLowerCase();
    const normalizedId = attribute.id.trim().toLowerCase();
    if (normalizedName) attributeLookup.set(normalizedName, attribute.id);
    if (normalizedId) attributeLookup.set(normalizedId, attribute.id);
  }

  return Object.entries(selectedAttributes).every(([key, value]) => {
    const normalizedKey = key.trim();
    const normalizedValue = value.trim();
    const canonicalKey = attributeLookup.get(normalizedKey.toLowerCase()) ?? normalizedKey;
    const matchedKey = Object.keys(variant.attributes ?? {}).find((variantKey) => {
      const variantKeyLower = variantKey.trim().toLowerCase();
      return variantKeyLower === canonicalKey.toLowerCase() || variantKeyLower === normalizedKey.toLowerCase();
    });

    if (!matchedKey) {
      return false;
    }

    return String(variant.attributes[matchedKey]).trim() === normalizedValue;
  });
}

export async function resolveCheckoutItems(items: unknown): Promise<{
  orderItems: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const database = await getDatabase();
  const productCollection = database.collection<Product>("products");

  let subtotal = 0;
  const orderItems: OrderItem[] = [];

  for (const item of items) {
    const normalizedItem = normalizeCartItem(item);
    const product = await productCollection.findOne({ slug: normalizedItem.productId });
    if (!product) {
      throw new Error(`Product "${normalizedItem.productId}" was not found.`);
    }

    let unitPrice = product.salePrice ?? product.price;
    let stock = product.stock ?? Number.MAX_SAFE_INTEGER;
    let sku = product.sku ?? null;
    let variantId = normalizedItem.variantId ?? null;
    const selectedAttributes = normalizedItem.selectedAttributes;
    let image = product.images?.[0] ?? null;

    if (product.variants && product.variants.length > 0) {
      const matchingVariant = product.variants.find((variant) => {
        if (variantId && variant.variantId !== variantId) {
          return false;
        }
        return variantMatchesSelection(product, variant, selectedAttributes);
      });

      if (!matchingVariant) {
        throw new Error(`The selected variant for "${product.name}" is not available.`);
      }

      unitPrice = matchingVariant.salePrice ?? matchingVariant.price;
      stock = matchingVariant.stock ?? 0;
      sku = matchingVariant.sku ?? sku;
      variantId = matchingVariant.variantId;
      image = matchingVariant.images?.[0] ?? image;
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Price for "${product.name}" is invalid.`);
    }

    if (!Number.isInteger(normalizedItem.quantity) || normalizedItem.quantity <= 0) {
      throw new Error(`Quantity for "${product.name}" must be greater than zero.`);
    }

    if (normalizedItem.quantity > stock) {
      throw new Error(`Only ${stock} unit(s) of "${product.name}" are available.`);
    }

    const lineTotal = unitPrice * normalizedItem.quantity;
    subtotal += lineTotal;

    orderItems.push({
      productId: product.slug,
      productName: product.name,
      sku,
      variantId,
      selectedAttributes: Object.keys(selectedAttributes).length > 0 ? selectedAttributes : undefined,
      quantity: normalizedItem.quantity,
      price: unitPrice,
      image,
    });
  }

  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;
  return { orderItems, subtotal, shipping, tax, total };
}

function createOrderNumber(count: number): string {
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${dateStamp}-${String(count + 1).padStart(5, "0")}`;
}

export async function createRazorpayOrder(total: number, customerName: string) {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !secret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment.");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100),
    currency: RAZORPAY_CURRENCY,
    receipt: `receipt_${Date.now()}_${customerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20)}`,
  });

  return razorpayOrder;
}

export async function createPendingOrderRecord(customer: CustomerDetails, items: OrderItem[], subtotal: number, total: number, razorpayOrderId: string) {
  const database = await getDatabase();
  const collection = database.collection("orders");
  const count = await collection.countDocuments();
  const now = new Date();
  const orderRecord = {
    orderNumber: createOrderNumber(count),
    customer,
    items,
    subtotal,
    shipping: 0,
    tax: 0,
    total,
    currency: RAZORPAY_CURRENCY,
    paymentStatus: "PENDING",
    orderStatus: "PROCESSING",
    razorpayOrderId,
    razorpayPaymentId: null,
    razorpaySignature: null,
    createdAt: now,
    updatedAt: now,
    paidAt: null,
  };

  const result = await collection.insertOne(orderRecord);
  return { ...orderRecord, _id: result.insertedId };
}

export function verifyRazorpaySignature(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_SECRET to your environment.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return expectedSignature === razorpaySignature;
}
