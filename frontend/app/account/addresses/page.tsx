import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/app/_components/footer";
import { Navbar } from "@/app/_components/navigation/navbar";
import { handleGetProfile } from "@/lib/actions/users-action";
import { getAuthToken } from "@/lib/cookie";

type AddressRecord = {
    _id?: string;
    label?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
};

const extractAddresses = (res: unknown): AddressRecord[] => {
    if (res && typeof res === "object" && "success" in res) {
        const result = res as { success?: boolean; data?: { addresses?: AddressRecord[] } };
        if (result.success && Array.isArray(result.data?.addresses)) return result.data.addresses;
    }
    return [];
};

export default async function AddressesPage() {
    const authToken = await getAuthToken();
    if (!authToken) redirect("/login");

    const addresses = extractAddresses(await handleGetProfile());

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />

            <main className="mx-auto w-full max-w-5xl px-6 py-12">
                <nav className="eyebrow mb-6 flex items-center gap-2 text-muted">
                    <Link href="/account" className="transition hover:text-ink">Account</Link>
                    <span>/</span>
                    <span className="text-ink">Addresses</span>
                </nav>

                <h1 className="h1 mb-10">Addresses</h1>

                {addresses.length === 0 ? (
                    <div className="border border-border p-8">
                        <h2 className="h4 mb-2">No saved addresses</h2>
                        <p className="body-sm text-muted">
                            You can add a shipping address during checkout.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {addresses.map((address) => (
                            <article key={address._id || address.line1} className="border border-border p-6">
                                <h2 className="h4 mb-3">{address.label || "Address"}</h2>
                                <div className="body-sm space-y-1 text-muted">
                                    <p>{address.line1}</p>
                                    {address.line2 ? <p>{address.line2}</p> : null}
                                    <p>
                                        {[address.city, address.state, address.postalCode]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </p>
                                    <p>{address.country}</p>
                                    <p>{address.phone}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
