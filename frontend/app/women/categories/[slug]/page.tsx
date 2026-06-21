import { ShopPage } from "@/app/(shop)/_components/shop-page";

interface WomenCategoryPageProps {
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

export default async function WomenCategoryPage({ params, searchParams }: WomenCategoryPageProps) {
    const [{ slug }, sp] = await Promise.all([params, searchParams]);
    return <ShopPage gender="f" title="Women" categorySlug={slug} searchParams={sp} />;
}
