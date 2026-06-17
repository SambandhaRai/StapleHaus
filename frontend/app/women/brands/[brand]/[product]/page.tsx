import { ProductDetail } from "@/app/(shop)/_components/product-detail";

interface WomenProductPageProps {
    params: Promise<{ brand: string; product: string }>;
}

export default async function WomenProductPage({ params }: WomenProductPageProps) {
    const { product } = await params;
    return <ProductDetail slug={product} />;
}
