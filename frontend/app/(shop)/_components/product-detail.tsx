import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck } from "lucide-react";
import { Navbar } from "@/app/_components/navigation/navbar";
import { Footer } from "@/app/_components/footer";
import { ProductCarousel } from "./product-carousel";
import { ProductGallery } from "./product-gallery";
import { ProductBuyPanel } from "./product-buy-panel";
import { getUploadUrl } from "@/lib/uploads";
import { getAuthToken } from "@/lib/cookie";
import { handleGetProductBySlug, handleGetProducts } from "@/lib/actions/products-action";
import { handleGetWishlist } from "@/lib/actions/wishlist-action";
import { handleGetCart } from "@/lib/actions/cart-action";

interface Variant {
    _id: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
    priceOverride?: number;
}

interface RefRecord {
    _id?: string;
    name?: string;
    slug?: string;
}

interface ProductRecord {
    _id: string;
    name: string;
    slug: string;
    description: string;
    brand?: RefRecord | string | null;
    category?: RefRecord | string | null;
    gender?: "m" | "f" | "unisex";
    basePrice: number;
    images?: string[];
    variants?: Variant[];
}

interface CarouselProduct {
    name: string;
    slug: string;
    brand?: { name?: string; slug?: string } | string | null;
    gender?: "m" | "f" | "unisex";
    images?: string[];
    basePrice: number;
    avgRating?: number;
    reviewCount?: number;
}

const asRef = (value: ProductRecord["brand"]): RefRecord | undefined =>
    value && typeof value === "object" ? value : undefined;

const extractProduct = (res: unknown): ProductRecord | null => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: ProductRecord };
        if (r.success && r.data) return r.data;
    }
    return null;
};

const extractProducts = (res: unknown): CarouselProduct[] => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: CarouselProduct[] };
        if (r.success && Array.isArray(r.data)) return r.data;
    }
    return [];
};

const isInWishlist = (res: unknown, productId: string): boolean => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: { productIds?: unknown[] } };
        if (r.success && Array.isArray(r.data?.productIds)) {
            return r.data.productIds.some((item) => {
                const id = item && typeof item === "object" && "_id" in item
                    ? String((item as { _id: unknown })._id)
                    : String(item);
                return id === productId;
            });
        }
    }
    return false;
};

const cartSkusForProduct = (res: unknown, productId: string): string[] => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as {
            success?: boolean;
            data?: { items?: { productId?: unknown; variantSku?: string }[] };
        };
        if (r.success && Array.isArray(r.data?.items)) {
            return r.data.items
                .filter((item) => {
                    const id = item.productId && typeof item.productId === "object" && "_id" in item.productId
                        ? String((item.productId as { _id: unknown })._id)
                        : String(item.productId);
                    return id === productId;
                })
                .map((item) => item.variantSku)
                .filter((sku): sku is string => Boolean(sku));
        }
    }
    return [];
};

interface ProductDetailProps {
    slug: string;
}

export async function ProductDetail({ slug }: ProductDetailProps) {
    const authToken = await getAuthToken();
    const loggedIn = Boolean(authToken);

    const [productRes, wishlistRes, cartRes] = await Promise.all([
        handleGetProductBySlug(slug),
        loggedIn ? handleGetWishlist() : Promise.resolve(null),
        loggedIn ? handleGetCart() : Promise.resolve(null),
    ]);

    const product = extractProduct(productRes);
    if (!product) notFound();

    const initialWishlisted = isInWishlist(wishlistRes, product._id);
    const cartSkus = cartSkusForProduct(cartRes, product._id);

    const brand = asRef(product.brand);
    const category = asRef(product.category);
    const images = (product.images || []).map((image) => getUploadUrl(image)).filter(Boolean);
    const variants = product.variants || [];

    const genderPath = product.gender === "f" ? "/women" : "/men";
    const genderLabel = product.gender === "f" ? "Women" : "Men";

    const moreRes = brand?._id
        ? await handleGetProducts({ brand: brand._id, limit: 12 })
        : null;
    const moreFromBrand = extractProducts(moreRes).filter((p) => p.slug !== product.slug);

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />

            <div className="mx-auto w-full max-w-7xl px-6 pt-6">
                <nav className="eyebrow flex flex-wrap items-center gap-2 text-muted">
                    <Link href="/" className="transition hover:text-ink">Home</Link>
                    <span>/</span>
                    <Link href={genderPath} className="transition hover:text-ink">{genderLabel}</Link>
                    <span>/</span>
                    <Link href={`${genderPath}/shop`} className="transition hover:text-ink">Brands</Link>
                    {brand?.slug ? (
                        <>
                            <span>/</span>
                            <Link
                                href={`${genderPath}/shop?brand=${brand.slug}`}
                                className="transition hover:text-ink"
                            >
                                {brand.name}
                            </Link>
                        </>
                    ) : null}
                    <span>/</span>
                    <span className="text-ink">{product.name}</span>
                </nav>
            </div>

            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-8 lg:grid-cols-2 lg:gap-16">
                <ProductGallery images={images} alt={product.name} />

                <div className="lg:py-2">
                    <div className="lg:sticky lg:top-24">
                        <ProductBuyPanel
                            productId={product._id}
                            brandName={brand?.name}
                            name={product.name}
                            basePrice={product.basePrice}
                            variants={variants}
                            loggedIn={loggedIn}
                            initialWishlisted={initialWishlisted}
                            initialCartSkus={cartSkus}
                        />

                        <div className="mt-10 border-t border-border pt-8">
                            <h2 className="h4 mb-3">Description</h2>
                            <p className="body-sm whitespace-pre-line text-neutral-600">
                                {product.description}
                            </p>

                            <ul className="mt-5 space-y-1.5">
                                {brand?.name ? (
                                    <li className="body-sm text-neutral-600">Brand: {brand.name}</li>
                                ) : null}
                                {category?.name ? (
                                    <li className="body-sm text-neutral-600">Category: {category.name}</li>
                                ) : null}
                            </ul>
                        </div>

                        <div className="mt-8 border-t border-border pt-8">
                            <h2 className="h4 mb-3">Shipping &amp; Returns</h2>
                            <div className="flex items-start gap-2">
                                <Truck size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-muted" />
                                <p className="body-sm text-neutral-600">
                                    Free standard shipping on all orders. 14 days returns —
                                    items must be unworn with original tags.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {moreFromBrand.length > 0 ? (
                <section className="mx-auto w-full max-w-7xl px-6 pb-20">
                    <div className="mb-8 flex items-end justify-between">
                        <h2 className="h2">More From {brand?.name}</h2>
                        {brand?.slug ? (
                            <Link
                                className="label-caps link-underline"
                                href={`${genderPath}/shop?brand=${brand.slug}`}
                            >
                                Shop {brand.name}
                            </Link>
                        ) : null}
                    </div>
                    <ProductCarousel products={moreFromBrand} />
                </section>
            ) : null}

            <Footer />
        </div>
    );
}
