"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { handleGetCart } from "@/lib/actions/cart-action";

interface CartContextValue {
    count: number;
    addToCount: (delta: number) => void;
    refresh: () => Promise<void>;
    reset: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const countItems = (res: unknown): number => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: { items?: { quantity?: number }[] } };
        if (r.success && Array.isArray(r.data?.items)) {
            return r.data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        }
    }
    return 0;
};

export function CartProvider({
    initialCount,
    children,
}: {
    initialCount: number;
    children: React.ReactNode;
}) {
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        setCount(initialCount);
    }, [initialCount]);

    const addToCount = useCallback((delta: number) => {
        setCount((current) => Math.max(0, current + delta));
    }, []);

    const refresh = useCallback(async () => {
        const res = await handleGetCart();
        setCount(countItems(res));
    }, []);

    const reset = useCallback(() => {
        setCount(0);
    }, []);

    return (
        <CartContext.Provider value={{ count, addToCount, refresh, reset }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within a CartProvider");
    return ctx;
}
