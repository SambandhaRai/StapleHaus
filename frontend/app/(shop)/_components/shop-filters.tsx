import Link from "next/link";
import { FilterSection } from "./filter-section";
import { ShopSizeFilter } from "./shop-size-filter";
import { ShopBrandFilter } from "./shop-brand-filter";
import { ShopPriceFilter } from "./shop-price-filter";

interface FilterRecord {
    _id: string;
    name?: string;
    slug?: string;
}

interface ShopFiltersProps {
    landingPath: string;
    categorySlug?: string;
    categories: FilterRecord[];
    brands: FilterRecord[];
    activeBrands: string[];
    activeSizes: string[];
    priceMin: number;
    priceMax: number;
    minPrice?: number;
    maxPrice?: number;
}

export function ShopFilters({
    landingPath,
    categorySlug,
    categories,
    brands,
    activeBrands,
    activeSizes,
    priceMin,
    priceMax,
    minPrice,
    maxPrice,
}: ShopFiltersProps) {
    return (
        <div className="lg:sticky lg:top-24">
            <FilterSection title="Categories">
                <ul className="space-y-2">
                    <li>
                        <Link
                            href={`${landingPath}/shop`}
                            className={`body-sm link-underline ${categorySlug ? "text-muted" : "text-ink"}`}
                        >
                            All
                        </Link>
                    </li>
                    {categories.map((category) => (
                        <li key={category._id}>
                            <Link
                                href={`${landingPath}/categories/${category.slug}`}
                                className={`body-sm link-underline ${categorySlug === category.slug ? "text-ink" : "text-muted"}`}
                            >
                                {category.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </FilterSection>

            <div className="mt-6 border-t border-border pt-6">
                <FilterSection title="Brand">
                    <ShopBrandFilter brands={brands} activeBrands={activeBrands} />
                </FilterSection>
            </div>

            <div className="mt-6 border-t border-border pt-6">
                <FilterSection title="Size">
                    <ShopSizeFilter activeSizes={activeSizes} />
                </FilterSection>
            </div>

            {priceMax > priceMin ? (
                <div className="mt-6 border-t border-border pt-6">
                    <FilterSection title="Price">
                        <ShopPriceFilter
                            minBound={priceMin}
                            maxBound={priceMax}
                            initialMin={minPrice ?? priceMin}
                            initialMax={maxPrice ?? priceMax}
                        />
                    </FilterSection>
                </div>
            ) : null}
        </div>
    );
}
