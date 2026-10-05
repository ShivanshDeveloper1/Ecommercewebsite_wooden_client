export function getCartItemKey(item: {
  productId: string;
  variantId?: string;
  selectedAttributes?: Record<string, string>;
}) {
  const identity = item.variantId ??
    (item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0
      ? JSON.stringify(Object.entries(item.selectedAttributes).sort(([left], [right]) => left.localeCompare(right)))
      : "default");
  return `${item.productId}::${identity}`;
}
