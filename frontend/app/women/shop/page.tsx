import { ShopPage } from "@/app/(shop)/_components/shop-page";

interface WomenShopPageProps {
    searchParams: Promise<{
        sort?: string;
        brand?: string;
        size?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
    }>;
}

export default async function WomenShopPage({ searchParams }: WomenShopPageProps) {
    const params = await searchParams;
    return <ShopPage gender="f" title="Women" searchParams={params} />;
}
