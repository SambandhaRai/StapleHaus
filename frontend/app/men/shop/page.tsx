import { ShopPage } from "@/app/(shop)/_components/shop-page";

interface MenShopPageProps {
    searchParams: Promise<{
        sort?: string;
        brand?: string;
        size?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
    }>;
}

export default async function MenShopPage({ searchParams }: MenShopPageProps) {
    const params = await searchParams;
    return <ShopPage gender="m" title="Men" searchParams={params} />;
}
