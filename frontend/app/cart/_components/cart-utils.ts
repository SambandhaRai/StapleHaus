import { getUploadUrl } from "@/lib/uploads";
import type { CartItem, CartProduct, CartVariant } from "./cart-types";

export const money = (value: number) => `$${value.toFixed(2)}`;

export const getProduct = (item: CartItem): CartProduct | null => {
    if (item.productId && typeof item.productId === "object") {
        return item.productId;
    }
    return null;
};

export const getVariant = (product: CartProduct | null, sku?: string): CartVariant | undefined =>
    product?.variants?.find((variant) => variant.sku === sku);

export const getUnitPrice = (item: CartItem) => {
    const product = getProduct(item);
    const variant = getVariant(product, item.variantSku);
    return variant?.priceOverride ?? product?.basePrice ?? 0;
};

export const getLineTotal = (item: CartItem) => getUnitPrice(item) * (item.quantity || 0);

export const getCartSubtotal = (items: CartItem[]) =>
    items.reduce((sum, item) => sum + getLineTotal(item), 0);

export const getCartQuantity = (items: CartItem[]) =>
    items.reduce((sum, item) => sum + (item.quantity || 0), 0);

export const getProductImage = (item: CartItem) => {
    const imageName = getProduct(item)?.images?.[0];
    return imageName ? getUploadUrl(imageName) : "";
};

export const getProductHref = (product: CartProduct | null) => {
    if (!product?.slug) return "/men/shop";

    const genderSegment = product.gender === "f" ? "women" : "men";
    const brandSlug =
        product.brand && typeof product.brand === "object" && product.brand.slug
            ? product.brand.slug
            : "unknown";

    return `/${genderSegment}/brands/${brandSlug}/${product.slug}`;
};
