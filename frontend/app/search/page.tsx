import Link from "next/link";
import { Navbar } from "@/app/_components/navigation/navbar";
import { Footer } from "@/app/_components/footer";
import { ProductCard } from "@/app/(shop)/_components/product-card";
import { ShopSort } from "@/app/(shop)/_components/shop-sort";
import { ShopFilters } from "@/app/(shop)/_components/shop-filters";
import { handleGetProducts } from "@/lib/actions/products-action";
import { handleGetBrands } from "@/lib/actions/brands-action";

interface SearchProduct {
    _id?: string;
    name: string;
    slug: string;
    brand?: { name?: string; slug?: string } | string | null;
    gender?: "m" | "f" | "unisex";
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
    products: SearchProduct[];
    page: number;
    totalPages: number;
    total: number;
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
            data?: SearchProduct[];
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

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        sort?: string;
        brand?: string;
        size?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
    }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = (params.q || "").trim();
    const sort = params.sort || "newest";
    const activeBrands = params.brand
        ? params.brand.split(",").map((b) => b.trim()).filter(Boolean)
        : [];
    const activeSizes = params.size
        ? params.size.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
    const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
    const page = Math.max(1, Number(params.page) || 1);

    if (!query) {
        return (
            <div className="flex flex-1 flex-col bg-background text-foreground">
                <Navbar />
                <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10">
                    <p className="eyebrow mb-2 text-muted">Search</p>
                    <h1 className="h1">Search</h1>
                    <p className="body-sm mt-4 text-muted">
                        Type something in the search bar to find products.
                    </p>
                </div>
                <Footer />
            </div>
        );
    }

    const brandsRes = await handleGetBrands();
    const brands = extractList<FilterRecord>(brandsRes);
    const brandIds = activeBrands
        .map((slug) => brands.find((brand) => brand.slug === slug)?._id)
        .filter((id): id is string => Boolean(id));

    const [productsRes, cheapestRes, dearestRes] = await Promise.all([
        handleGetProducts({
            q: query,
            sort: sort as "newest" | "price_asc" | "price_desc" | "rating",
            brand: brandIds.length > 0 ? brandIds.join(",") : undefined,
            size: activeSizes.length > 0 ? activeSizes.join(",") : undefined,
            minPrice,
            maxPrice,
            page,
            limit: PAGE_SIZE,
        }),
        handleGetProducts({ q: query, sort: "price_asc", limit: 1 }),
        handleGetProducts({ q: query, sort: "price_desc", limit: 1 }),
    ]);

    const { products, totalPages, total } = extractProducts(productsRes);
    const cheapest = extractProducts(cheapestRes).products[0]?.basePrice ?? 0;
    const dearest = extractProducts(dearestRes).products[0]?.basePrice ?? 0;
    const priceMin = Math.floor(cheapest);
    const priceMax = Math.ceil(dearest);

    const buildHref = (next: { page?: string }) => {
        const sp = new URLSearchParams();
        sp.set("q", query);
        if (sort && sort !== "newest") sp.set("sort", sort);
        if (activeBrands.length > 0) sp.set("brand", activeBrands.join(","));
        if (activeSizes.length > 0) sp.set("size", activeSizes.join(","));
        if (minPrice !== undefined) sp.set("minPrice", String(minPrice));
        if (maxPrice !== undefined) sp.set("maxPrice", String(maxPrice));
        if (next.page) sp.set("page", next.page);
        return `/search?${sp.toString()}`;
    };

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />

            <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-4 px-6 pb-8 pt-10">
                <div>
                    <p className="eyebrow mb-2 text-muted">Search</p>
                    <h1 className="h1">&ldquo;{query}&rdquo;</h1>
                    <p className="body-sm mt-2 text-muted">
                        {total} {total === 1 ? "result" : "results"}
                    </p>
                </div>
                <ShopSort value={sort} />
            </div>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 lg:flex-row">
                <aside className="shrink-0 lg:w-56">
                    <ShopFilters
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
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.slug}
                                        product={product}
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
                        </>
                    ) : (
                        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 text-center">
                            <p className="body-sm text-muted">No products match your search and filters.</p>
                            <Link
                                href={`/search?q=${encodeURIComponent(query)}`}
                                className="label-caps inline-flex border border-ink px-5 py-2.5 transition hover:bg-ink hover:text-paper"
                            >
                                Clear Filters
                            </Link>
                        </div>
                    )}
                </section>
            </div>

            <Footer />
        </div>
    );
}
