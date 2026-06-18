"use server";

import { cookies } from "next/headers";

export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });
}

export const getAuthToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    return token || null;
}

export const setUserData = async (userData: any) => {
    const cookieStore = await cookies();
    cookieStore.set("user_data", JSON.stringify(userData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });
}

export const getUserData = async () => {
    const cookieStore = await cookies();
    const userData = cookieStore.get("user_data")?.value;
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("user_data");
};

export const setGoogleNonce = async (nonce: string) => {
    const cookieStore = await cookies();
    cookieStore.set("google_nonce", nonce, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
    });
}

export const getGoogleNonce = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("google_nonce")?.value || null;
}

export const clearGoogleNonce = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("google_nonce");
};