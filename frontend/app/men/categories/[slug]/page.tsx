import { ShopPage } from "@/app/(shop)/_components/shop-page";

interface MenCategoryPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{
        sort?: string;
        brand?: string;
        size?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
    }>;
}

export default async function MenCategoryPage({ params, searchParams }: MenCategoryPageProps) {
    const [{ slug }, sp] = await Promise.all([params, searchParams]);
    return <ShopPage gender="m" title="Men" categorySlug={slug} searchParams={sp} />;
}
