import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/app/_components/navigation/navbar";
import { Footer } from "@/app/_components/footer";
import { ProductCarousel } from "./product-carousel";
import { getUploadUrl } from "@/lib/uploads";
import { handleGetProducts } from "@/lib/actions/products-action";
import { handleGetCategories } from "@/lib/actions/categories-action";

interface LandingProduct {
    _id?: string;
    name: string;
    slug: string;
    brand?: { name?: string } | string | null;
    category?: { name?: string; slug?: string } | string | null;
    images?: string[];
    basePrice: number;
    avgRating?: number;
    reviewCount?: number;
}

interface CategoryRecord {
    _id: string;
    name?: string;
    slug?: string;
}

interface ShopLandingProps {
    gender: "m" | "f";
    title: string;
}

const extractProducts = (res: unknown): LandingProduct[] => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: LandingProduct[] };
        if (r.success && Array.isArray(r.data)) return r.data;
    }
    return [];
};

const extractCategories = (res: unknown): CategoryRecord[] => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: CategoryRecord[] };
        if (r.success && Array.isArray(r.data)) return r.data;
    }
    return [];
};

export async function ShopLanding({ gender }: ShopLandingProps) {
    const [productsRes, categoriesRes] = await Promise.all([
        handleGetProducts({ gender, sort: "newest", limit: 50 }),
        handleGetCategories(),
    ]);

    const products = extractProducts(productsRes);
    const categories = extractCategories(categoriesRes);

    const landingPath = gender === "m" ? "/men" : "/women";
    const shopBase = `${landingPath}/shop`;

    const categoryImages = new Map<string, string>();
    for (const product of products) {
        const slug =
            product.category && typeof product.category === "object"
                ? product.category.slug
                : undefined;
        const image = product.images?.[0];
        if (slug && image && !categoryImages.has(slug)) {
            categoryImages.set(slug, image);
        }
    }

    const categoryTiles = categories.map((category) => ({
        name: category.name || "",
        slug: category.slug || "",
        image: category.slug ? getUploadUrl(categoryImages.get(category.slug)) : "",
    }));

    const newArrivals = products.slice(0, 12);

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />

            <section className="mx-auto w-full max-w-7xl px-6 pt-12">
                <h1 className="h2 mb-8">What are you looking for?</h1>
                {categoryTiles.length > 0 ? (
                    <div className="flex gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
                        {categoryTiles.map((tile) => (
                            <Link
                                key={tile.slug || tile.name}
                                href={`${landingPath}/categories/${tile.slug}`}
                                className="group block w-[44%] shrink-0 sm:w-[31%] md:w-[23.5%] lg:w-[19%]"
                            >
                                <div className="relative mb-3 aspect-square overflow-hidden bg-neutral-100">
                                    {tile.image ? (
                                        <Image
                                            src={tile.image}
                                            alt={tile.name}
                                            fill
                                            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <span className="eyebrow text-subtle">{tile.name}</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="h4">{tile.name}</h3>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="body-sm text-muted">No categories available right now.</p>
                )}
            </section>

            <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-16">
                <div className="mb-8 flex items-end justify-between">
                    <h2 className="h2">New Arrivals</h2>
                    <Link className="label-caps link-underline" href={shopBase}>View all</Link>
                </div>
                {newArrivals.length > 0 ? (
                    <ProductCarousel products={newArrivals} />
                ) : (
                    <p className="body-sm text-muted">No products available right now.</p>
                )}
            </section>

            <Footer />
        </div>
    );
}
