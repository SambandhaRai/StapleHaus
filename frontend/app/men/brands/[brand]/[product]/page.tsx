import { ProductDetail } from "@/app/(shop)/_components/product-detail";

interface MenProductPageProps {
    params: Promise<{ brand: string; product: string }>;
}

export default async function MenProductPage({ params }: MenProductPageProps) {
    const { product } = await params;
    return <ProductDetail slug={product} />;
}
