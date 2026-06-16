import Link from "next/link";
import { Navbar } from "@/app/_components/navbar";
import { Footer } from "@/app/_components/footer";
import { ProductCarousel } from "@/app/_components/product-carousel";
import { handleGetProducts } from "@/lib/actions/products-action";

interface HomeProduct {
  name: string;
  slug: string;
  brand?: { name?: string } | string | null;
  images?: string[];
  basePrice: number;
  avgRating?: number;
  reviewCount?: number;
}

const heroTiles = [
  { label: "Men", href: "#" },
  { label: "Women", href: "#" },
  { label: "Archives", href: "#" },
];

const extractProducts = (res: unknown): HomeProduct[] => {
  if (res && typeof res === "object" && "success" in res) {
    const r = res as { success?: boolean; data?: HomeProduct[] };
    if (r.success && Array.isArray(r.data)) return r.data;
  }
  return [];
};

export default async function Home() {
  const [mensRes, womensRes] = await Promise.all([
    handleGetProducts({ gender: "m", sort: "newest", limit: 12 }),
    handleGetProducts({ gender: "f", sort: "newest", limit: 12 }),
  ]);

  const mens = extractProducts(mensRes);
  const womens = extractProducts(womensRes);

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <Navbar />

      <section className="grid grid-cols-1 sm:grid-cols-3">
        {heroTiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group relative flex h-[55vh] items-center justify-center overflow-hidden border-b border-border bg-neutral-100 sm:h-[70vh] sm:border-b-0 sm:border-r sm:last:border-r-0"
          >
            <span
              className="display text-neutral-300 transition-colors duration-300 group-hover:text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tile.label}
            </span>
          </Link>
        ))}
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pt-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="h2">Men&apos;s New Arrivals</h2>
          <Link className="label-caps link-underline" href="#">View all</Link>
        </div>
        {mens.length > 0 ? (
          <ProductCarousel products={mens} />
        ) : (
          <p className="body-sm text-muted">No products available right now.</p>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="h2">Women&apos;s New Arrivals</h2>
          <Link className="label-caps link-underline" href="#">View all</Link>
        </div>
        {womens.length > 0 ? (
          <ProductCarousel products={womens} />
        ) : (
          <p className="body-sm text-muted">No products available right now.</p>
        )}
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-7xl px-6 py-24 text-center">
          <h2 className="display mb-10">Sale</h2>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <Link className="h3 link-underline" href="#">Shop Men&apos;s Sale</Link>
            <span className="h3 text-subtle">/</span>
            <Link className="h3 link-underline" href="#">Shop Women&apos;s Sale</Link>
            <span className="h3 text-subtle">/</span>
            <Link className="h3 link-underline" href="#">Shop Life Sale</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
