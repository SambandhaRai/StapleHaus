import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { PasswordExpiryDialog } from "./_components/password-expiry-dialog";
import { getAuthToken, getUserData } from "@/lib/cookie";
import { handleGetCart } from "@/lib/actions/cart-action";
import { handleGetWishlist } from "@/lib/actions/wishlist-action";

const extractCartCount = (res: unknown): number => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: { items?: { quantity?: number }[] } };
        if (r.success && Array.isArray(r.data?.items)) {
            return r.data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        }
    }
    return 0;
};

const extractWishlistIds = (res: unknown): string[] => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: { productIds?: unknown[] } };
        if (r.success && Array.isArray(r.data?.productIds)) {
            return r.data.productIds
                .map((entry) =>
                    typeof entry === "string" ? entry : (entry as { _id?: string })?._id || ""
                )
                .filter(Boolean);
        }
    }
    return [];
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StapleHaus",
    template: "%s · StapleHaus",
  },
  description: "Curated clothing and footwear.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authToken = await getAuthToken();
  const [cartRes, wishlistRes] = authToken
    ? await Promise.all([handleGetCart(), handleGetWishlist()])
    : [null, null];
  const initialCartCount = extractCartCount(cartRes);
  const initialWishlistIds = extractWishlistIds(wishlistRes);
  const userData = authToken ? await getUserData() : null;
  const passwordExpiresAt = typeof userData?.passwordExpiresAt === "string" ? userData.passwordExpiresAt : null;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider initialCount={initialCartCount}>
          <WishlistProvider
            initialProductIds={initialWishlistIds}
            loggedIn={Boolean(authToken)}
          >
            {children}
          </WishlistProvider>
        </CartProvider>
        <PasswordExpiryDialog passwordExpiresAt={passwordExpiresAt} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          theme="light"
        />
      </body>
    </html>
  );
}
