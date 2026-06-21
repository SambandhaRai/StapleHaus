import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { CartProvider } from "./_components/cart-provider";
import { getAuthToken } from "@/lib/cookie";
import { handleGetCart } from "@/lib/actions/cart-action";

const extractCartCount = (res: unknown): number => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: { items?: { quantity?: number }[] } };
        if (r.success && Array.isArray(r.data?.items)) {
            return r.data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        }
    }
    return 0;
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
  const cartRes = authToken ? await handleGetCart() : null;
  const initialCartCount = extractCartCount(cartRes);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider initialCount={initialCartCount}>
          {children}
        </CartProvider>
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
