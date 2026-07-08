import { Footer } from "@/app/_components/footer";
import { Navbar } from "@/app/_components/navigation/navbar";
import { PaymentResult } from "./_components/payment-result";

export default async function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ data?: string }>;
}) {
    const { data } = await searchParams;

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />
            <PaymentResult data={data ?? null} />
            <Footer />
        </div>
    );
}
