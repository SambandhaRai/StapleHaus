"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { handleLogout } from "@/lib/actions/auth-action";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "./button";

export function LogoutButton() {
    const router = useRouter();
    const { reset } = useCart();
    const { reset: resetWishlist } = useWishlist();
    const [loading, setLoading] = useState(false);

    const onLogout = async () => {
        setLoading(true);
        await handleLogout();
        reset();
        resetWishlist();
        toast.success("Logged out");
        router.push("/");
        router.refresh();
    };

    return (
        <Button variant="secondary" onClick={onLogout} isLoading={loading}>
            Log out
        </Button>
    );
}
