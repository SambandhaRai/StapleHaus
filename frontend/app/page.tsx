import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/app/_components/navigation/navbar";
import { Footer } from "@/app/_components/footer";
import { ProductCarousel } from "@/app/(shop)/_components/product-carousel";
import { handleGetProducts } from "@/lib/actions/products-action";
import { handleGetWishlist } from "@/lib/actions/wishlist-action";
import { getAuthToken } from "@/lib/cookie";

interface HomeProduct {
  _id?: string;
  name: string;
  slug: string;
  brand?: { name?: string } | string | null;
  images?: string[];
  basePrice: number;
  avgRating?: number;
  reviewCount?: number;
}

const heroTiles = [
  { label: "Men", href: "/men", image: "/heroImages/men.webp" },
  { label: "Women", href: "/women", image: "/heroImages/women.webp" },
];

const extractProducts = (res: unknown): HomeProduct[] => {
  if (res && typeof res === "object" && "success" in res) {
    const r = res as { success?: boolean; data?: HomeProduct[] };
    if (r.success && Array.isArray(r.data)) return r.data;
  }
  return [];
};

const extractWishlistProductIds = (res: unknown): string[] => {
  if (res && typeof res === "object" && "success" in res) {
    const r = res as { success?: boolean; data?: { productIds?: unknown[] } };
    if (r.success && Array.isArray(r.data?.productIds)) {
      return r.data.productIds
        .map((item) => {
          if (item && typeof item === "object" && "_id" in item) {
            return String((item as { _id: unknown })._id);
          }
          return String(item);
        })
        .filter(Boolean);
    }
  }
  return [];
};

export default async function Home() {
  const authToken = await getAuthToken();
  const loggedIn = Boolean(authToken);

  const [mensRes, womensRes, wishlistRes] = await Promise.all([
    handleGetProducts({ gender: "m", sort: "newest", limit: 12 }),
    handleGetProducts({ gender: "f", sort: "newest", limit: 12 }),
    loggedIn ? handleGetWishlist() : Promise.resolve(null),
  ]);

  const mens = extractProducts(mensRes);
  const womens = extractProducts(womensRes);
  const wishlistedProductIds = extractWishlistProductIds(wishlistRes);

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <Navbar />

      <section className="grid grid-cols-1 sm:grid-cols-2">
        {heroTiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group relative flex h-[58vh] items-center justify-center overflow-hidden border-b border-border bg-neutral-100 sm:h-[74vh] sm:border-b-0 sm:border-r sm:last:border-r-0"
          >
            <Image
              src={tile.image}
              alt={`${tile.label} collection`}
              fill
              priority
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-ink/20 transition duration-300 group-hover:bg-ink/10" />
            <span
              className="display relative text-paper drop-shadow-sm"
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
          <Link className="label-caps link-underline" href="/men/shop">View all</Link>
        </div>
        {mens.length > 0 ? (
          <ProductCarousel
            products={mens}
            priorityCount={5}
            loggedIn={loggedIn}
            wishlistedProductIds={wishlistedProductIds}
          />
        ) : (
          <p className="body-sm text-muted">No products available right now.</p>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="h2">Women&apos;s New Arrivals</h2>
          <Link className="label-caps link-underline" href="/women/shop">View all</Link>
        </div>
        {womens.length > 0 ? (
          <ProductCarousel
            products={womens}
            loggedIn={loggedIn}
            wishlistedProductIds={wishlistedProductIds}
          />
        ) : (
          <p className="body-sm text-muted">No products available right now.</p>
        )}
      </section>

      <Footer />
    </div>
  );
}
