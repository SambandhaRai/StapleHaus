export const API = {
    AUTH: {
        REGISTER: "/api/auth/register",
        VERIFY_OTP: "/api/auth/verify-otp",
        RESEND_OTP: "/api/auth/resend-otp",
        LOGIN: "/api/auth/login",
        LOGIN_2FA: "/api/auth/login/2fa",
        GOOGLE: "/api/auth/google",
        LOGOUT: "/api/auth/logout",
    },
    USER: {
        GET_PROFILE: "/api/users/me",
        UPDATE_PROFILE: "/api/users/me",
        CHANGE_PASSWORD: "/api/users/me/password",
        ADD_ADDRESS: "/api/users/me/addresses",
        UPDATE_ADDRESS: (addressId: string) => `/api/users/me/addresses/${addressId}`,
        DELETE_ADDRESS: (addressId: string) => `/api/users/me/addresses/${addressId}`,
        TWO_FACTOR_SETUP: "/api/users/me/2fa/setup",
        TWO_FACTOR_ENABLE: "/api/users/me/2fa/enable",
        TWO_FACTOR_DISABLE: "/api/users/me/2fa/disable",
        SESSIONS: "/api/users/me/sessions",
        REVOKE_SESSION: (sessionId: string) => `/api/users/me/sessions/${sessionId}`,
    },
    PRODUCT: {
        GET_ALL: (
            params?: {
                gender?: "m" | "f" | "unisex";
                category?: string;
                brand?: string;
                size?: string;
                color?: string;
                minPrice?: number;
                maxPrice?: number;
                q?: string;
                sort?: "newest" | "price_asc" | "price_desc" | "rating";
                page?: number;
                limit?: number;
            }
        ) => {
            if (!params) return "/api/products";

            const q = new URLSearchParams();

            if (params.gender) q.set("gender", params.gender);
            if (params.category) q.set("category", params.category);
            if (params.brand) q.set("brand", params.brand);
            if (params.size) q.set("size", params.size);
            if (params.color) q.set("color", params.color);
            if (params.minPrice !== undefined) q.set("minPrice", String(params.minPrice));
            if (params.maxPrice !== undefined) q.set("maxPrice", String(params.maxPrice));
            if (params.q) q.set("q", params.q);
            if (params.sort) q.set("sort", params.sort);
            if (params.page !== undefined) q.set("page", String(params.page));
            if (params.limit !== undefined) q.set("limit", String(params.limit));

            const query = q.toString();
            return query ? `/api/products?${query}` : "/api/products";
        },
        GET_BY_SLUG: (slug: string) => `/api/products/${slug}`,
        CREATE: "/api/products",
        UPDATE: (id: string) => `/api/products/${id}`,
        DELETE: (id: string) => `/api/products/${id}`,
    },
    BRAND: {
        GET_ALL: "/api/brands",
        CREATE: "/api/brands",
        UPDATE: (id: string) => `/api/brands/${id}`,
        DELETE: (id: string) => `/api/brands/${id}`,
    },
    CATEGORY: {
        GET_ALL: "/api/categories",
        CREATE: "/api/categories",
        UPDATE: (id: string) => `/api/categories/${id}`,
        DELETE: (id: string) => `/api/categories/${id}`,
    },
    CART: {
        GET: "/api/cart",
        ADD_ITEM: "/api/cart/items",
        UPDATE_ITEM: (itemId: string) => `/api/cart/items/${itemId}`,
        REMOVE_ITEM: (itemId: string) => `/api/cart/items/${itemId}`,
    },
    WISHLIST: {
        GET: "/api/wishlist",
        ADD_ITEM: "/api/wishlist/items",
        REMOVE_ITEM: (productId: string) => `/api/wishlist/items/${productId}`,
    },
    ORDER: {
        CHECKOUT: "/api/orders",
        GET_MY_ORDERS: "/api/orders",
        GET_BY_ID: (id: string) => `/api/orders/${id}`,
    },
    REVIEW: {
        GET_FOR_PRODUCT: (productId: string) => `/api/products/${productId}/reviews`,
        CREATE: (productId: string) => `/api/products/${productId}/reviews`,
        DELETE: (id: string) => `/api/reviews/${id}`,
    },
    DISCOUNT: {
        VALIDATE: "/api/discounts/validate",
    },
    ADMIN: {
        ORDER: {
            GET_ALL: "/api/admin/orders",
            UPDATE_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
        },
        DISCOUNT: {
            GET_ALL: "/api/admin/discounts",
            CREATE: "/api/admin/discounts",
            UPDATE: (id: string) => `/api/admin/discounts/${id}`,
            DELETE: (id: string) => `/api/admin/discounts/${id}`,
        },
    },
};
