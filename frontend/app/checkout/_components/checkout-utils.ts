import { formatPrice } from "@/lib/format";
import type { CheckoutCartItem, CheckoutProduct } from "./checkout-types";

export const money = formatPrice;

export const getProduct = (item: CheckoutCartItem): CheckoutProduct | null =>
    item.productId && typeof item.productId === "object" ? item.productId : null;

export const getVariantPrice = (item: CheckoutCartItem) => {
    const product = getProduct(item);
    const variant = product?.variants?.find((entry) => entry.sku === item.variantSku);
    return variant?.priceOverride ?? product?.basePrice ?? 0;
};

export const getSubtotal = (items: CheckoutCartItem[]) =>
    items.reduce((sum, item) => sum + getVariantPrice(item) * (item.quantity || 0), 0);

export const getItemCount = (items: CheckoutCartItem[]) =>
    items.reduce((sum, item) => sum + (item.quantity || 0), 0);
