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
    brands: FilterRecord[];
    activeBrands: string[];
    activeSizes: string[];
    priceMin: number;
    priceMax: number;
    minPrice?: number;
    maxPrice?: number;
    landingPath?: string;
    categorySlug?: string;
    categories?: FilterRecord[];
}

export function ShopFilters({
    brands,
    activeBrands,
    activeSizes,
    priceMin,
    priceMax,
    minPrice,
    maxPrice,
    landingPath,
    categorySlug,
    categories,
}: ShopFiltersProps) {
    const sections: { id: string; node: React.ReactNode }[] = [];

    if (landingPath && categories && categories.length > 0) {
        sections.push({
            id: "categories",
            node: (
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
            ),
        });
    }

    sections.push({
        id: "brand",
        node: (
            <FilterSection title="Brand">
                <ShopBrandFilter brands={brands} activeBrands={activeBrands} />
            </FilterSection>
        ),
    });

    sections.push({
        id: "size",
        node: (
            <FilterSection title="Size">
                <ShopSizeFilter activeSizes={activeSizes} />
            </FilterSection>
        ),
    });

    if (priceMax > priceMin) {
        sections.push({
            id: "price",
            node: (
                <FilterSection title="Price">
                    <ShopPriceFilter
                        minBound={priceMin}
                        maxBound={priceMax}
                        initialMin={minPrice ?? priceMin}
                        initialMax={maxPrice ?? priceMax}
                    />
                </FilterSection>
            ),
        });
    }

    return (
        <div className="lg:sticky lg:top-24">
            {sections.map((section, index) => (
                <div
                    key={section.id}
                    className={index === 0 ? "" : "mt-6 border-t border-border pt-6"}
                >
                    {section.node}
                </div>
            ))}
        </div>
    );
}
