"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
    handleGetWishlist,
    handleAddToWishlist,
    handleRemoveFromWishlist,
} from "@/lib/actions/wishlist-action";

interface WishlistContextValue {
    productIds: string[];
    loggedIn: boolean;
    isWishlisted: (productId: string) => boolean;
    toggle: (product: { _id: string; name?: string }) => Promise<void>;
    remove: (productId: string) => Promise<boolean>;
    refresh: () => Promise<void>;
    reset: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const extractProductIds = (res: unknown): string[] => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: { productIds?: unknown[] } };
        if (r.success && Array.isArray(r.data?.productIds)) {
            return r.data.productIds
                .map((entry) =>
                    typeof entry === "string"
                        ? entry
                        : (entry as { _id?: string })?._id || ""
                )
                .filter(Boolean);
        }
    }
    return [];
};

export function WishlistProvider({
    initialProductIds,
    loggedIn,
    children,
}: {
    initialProductIds: string[];
    loggedIn: boolean;
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [productIds, setProductIds] = useState<string[]>(initialProductIds);
    const [pending, setPending] = useState<string | null>(null);
    const initialKey = initialProductIds.join(",");
    const [syncedKey, setSyncedKey] = useState(initialKey);

    if (syncedKey !== initialKey) {
        setSyncedKey(initialKey);
        setProductIds(initialKey ? initialKey.split(",") : []);
    }

    const isWishlisted = useCallback(
        (productId: string) => productIds.includes(productId),
        [productIds]
    );

    const refresh = useCallback(async () => {
        if (!loggedIn) {
            setProductIds([]);
            return;
        }
        const res = await handleGetWishlist();
        setProductIds(extractProductIds(res));
    }, [loggedIn]);

    const reset = useCallback(() => {
        setProductIds([]);
    }, []);

    const remove = useCallback(async (productId: string) => {
        const previous = productIds;
        setProductIds((current) => current.filter((id) => id !== productId));

        const res = await handleRemoveFromWishlist(productId);
        if (res.success) {
            toast.success(res.message || "Removed from wishlist");
            return true;
        }

        setProductIds(previous);
        toast.error(res.message || "Failed to remove item");
        return false;
    }, [productIds]);

    const toggle = useCallback(
        async (product: { _id: string; name?: string }) => {
            if (!loggedIn) {
                router.push("/login");
                return;
            }
            if (!product._id || pending === product._id) return;

            const wasWishlisted = productIds.includes(product._id);
            const previous = productIds;

            setPending(product._id);
            setProductIds((current) =>
                wasWishlisted
                    ? current.filter((id) => id !== product._id)
                    : [...current, product._id]
            );

            const res = wasWishlisted
                ? await handleRemoveFromWishlist(product._id)
                : await handleAddToWishlist(product._id);
            setPending(null);

            if (res.success) {
                toast.success(
                    res.message || (wasWishlisted ? "Removed from wishlist" : "Added to wishlist")
                );
                return;
            }

            setProductIds(previous);
            toast.error(res.message || "Could not update wishlist");
        },
        [loggedIn, pending, productIds, router]
    );

    return (
        <WishlistContext.Provider
            value={{ productIds, loggedIn, isWishlisted, toggle, remove, refresh, reset }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
    return ctx;
}
