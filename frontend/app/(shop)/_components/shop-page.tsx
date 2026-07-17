import Link from "next/link";
import { Navbar } from "@/app/_components/navigation/navbar";
import { Footer } from "@/app/_components/footer";
import { ProductCard } from "./product-card";
import { ShopSort } from "./shop-sort";
import { ShopFilters } from "./shop-filters";
import { handleGetProducts } from "@/lib/actions/products-action";
import { handleGetBrands } from "@/lib/actions/brands-action";
import { handleGetCategories } from "@/lib/actions/categories-action";

interface ShopProduct {
    _id?: string;
    name: string;
    slug: string;
    brand?: { name?: string } | string | null;
    images?: string[];
    basePrice: number;
    avgRating?: number;
    reviewCount?: number;
}

interface FilterRecord {
    _id: string;
    name?: string;
    slug?: string;
}

interface ProductsResult {
    products: ShopProduct[];
    page: number;
    totalPages: number;
    total: number;
}

interface ShopPageProps {
    gender: "m" | "f";
    title: string;
    categorySlug?: string;
    searchParams?: {
        sort?: string;
        brand?: string;
        size?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
    };
}

const PAGE_SIZE = 24;

const extractList = <T,>(res: unknown): T[] => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: T[] };
        if (r.success && Array.isArray(r.data)) return r.data;
    }
    return [];
};

const extractProducts = (res: unknown): ProductsResult => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as {
            success?: boolean;
            data?: ShopProduct[];
            page?: number;
            totalPages?: number;
            total?: number;
        };
        if (r.success && Array.isArray(r.data)) {
            return {
                products: r.data,
                page: r.page || 1,
                totalPages: r.totalPages || 1,
                total: r.total ?? r.data.length,
            };
        }
    }
    return { products: [], page: 1, totalPages: 1, total: 0 };
};

export async function ShopPage({ gender, title, categorySlug, searchParams }: ShopPageProps) {
    const sort = searchParams?.sort || "newest";
    const activeBrands = searchParams?.brand
        ? searchParams.brand.split(",").map((b) => b.trim()).filter(Boolean)
        : [];
    const activeSizes = searchParams?.size
        ? searchParams.size.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    const minPrice = searchParams?.minPrice ? Number(searchParams.minPrice) : undefined;
    const maxPrice = searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined;
    const page = Math.max(1, Number(searchParams?.page) || 1);

    const [brandsRes, categoriesRes] = await Promise.all([
        handleGetBrands(),
        handleGetCategories(),
    ]);

    const brands = extractList<FilterRecord>(brandsRes);
    const categories = extractList<FilterRecord>(categoriesRes);

    const activeCategory = categorySlug
        ? categories.find((category) => category.slug === categorySlug)
        : undefined;
    const brandIds = activeBrands
        .map((slug) => brands.find((brand) => brand.slug === slug)?._id)
        .filter((id): id is string => Boolean(id));

    const [productsRes, cheapestRes, dearestRes] = await Promise.all([
        handleGetProducts({
            gender,
            sort: sort as "newest" | "price_asc" | "price_desc" | "rating",
            category: activeCategory?._id,
            brand: brandIds.length > 0 ? brandIds.join(",") : undefined,
            size: activeSizes.length > 0 ? activeSizes.join(",") : undefined,
            minPrice,
            maxPrice,
            page,
            limit: PAGE_SIZE,
        }),
        handleGetProducts({ gender, category: activeCategory?._id, sort: "price_asc", limit: 1 }),
        handleGetProducts({ gender, category: activeCategory?._id, sort: "price_desc", limit: 1 }),
    ]);

    const { products, totalPages, total } = extractProducts(productsRes);

    const cheapest = extractProducts(cheapestRes).products[0]?.basePrice ?? 0;
    const dearest = extractProducts(dearestRes).products[0]?.basePrice ?? 0;
    const priceMin = Math.floor(cheapest);
    const priceMax = Math.ceil(dearest);

    const landingPath = gender === "m" ? "/men" : "/women";
    const basePath = categorySlug ? `${landingPath}/categories/${categorySlug}` : `${landingPath}/shop`;
    const pageTitle = activeCategory?.name || "New Arrivals";

    const buildHref = (next: { page?: string }) => {
        const params = new URLSearchParams();
        if (sort && sort !== "newest") params.set("sort", sort);
        if (activeBrands.length > 0) params.set("brand", activeBrands.join(","));
        if (activeSizes.length > 0) params.set("size", activeSizes.join(","));
        if (minPrice !== undefined) params.set("minPrice", String(minPrice));
        if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
        if (next.page) params.set("page", next.page);
        const query = params.toString();
        return query ? `${basePath}?${query}` : basePath;
    };

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />

            <div className="mx-auto w-full max-w-7xl px-6 pt-6">
                <nav className="eyebrow flex items-center gap-2 text-muted">
                    <Link href="/" className="transition hover:text-ink">Home</Link>
                    <span>/</span>
                    <Link href={landingPath} className="transition hover:text-ink">{title}</Link>
                    <span>/</span>
                    <span className="text-ink">{pageTitle}</span>
                </nav>
            </div>

            <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-4 px-6 pb-8 pt-4">
                <h1 className="h1">{pageTitle}</h1>
                <ShopSort value={sort} />
            </div>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 lg:flex-row">
                <aside className="shrink-0 lg:w-56">
                    <ShopFilters
                        landingPath={landingPath}
                        categorySlug={categorySlug}
                        categories={categories}
                        brands={brands}
                        activeBrands={activeBrands}
                        activeSizes={activeSizes}
                        priceMin={priceMin}
                        priceMax={priceMax}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                    />
                </aside>

                <section className="flex-1">
                    {products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                                {products.map((product, index) => (
                                    <ProductCard
                                        key={product.slug}
                                        product={product}
                                        priority={index === 0}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-16 flex items-center justify-center gap-2">
                                    {page > 1 && (
                                        <Link
                                            href={buildHref({ page: String(page - 1) })}
                                            className="label-caps link-underline px-2 py-1"
                                        >
                                            Prev
                                        </Link>
                                    )}
                                    {Array.from({ length: totalPages }).map((_, i) => {
                                        const pageNumber = i + 1;
                                        return (
                                            <Link
                                                key={pageNumber}
                                                href={buildHref({ page: pageNumber === 1 ? undefined : String(pageNumber) })}
                                                className={`numeric flex h-8 min-w-8 items-center justify-center px-2 text-sm transition ${pageNumber === page
                                                    ? "bg-ink text-paper"
                                                    : "text-muted hover:text-ink"
                                                    }`}
                                            >
                                                {pageNumber}
                                            </Link>
                                        );
                                    })}
                                    {page < totalPages && (
                                        <Link
                                            href={buildHref({ page: String(page + 1) })}
                                            className="label-caps link-underline px-2 py-1"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            )}

                            <p className="body-sm mt-8 text-center text-muted">
                                Showing {products.length} of {total} items
                            </p>
                        </>
                    ) : (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <p className="body-sm text-muted">No products match your filters right now.</p>
                        </div>
                    )}
                </section>
            </div>

            <Footer />
        </div>
    );
}
