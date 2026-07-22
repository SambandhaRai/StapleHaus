"use server";

import { cookies } from "next/headers";

type StoredUserData = {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
};

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

export const setUserData = async (userData: StoredUserData) => {
    const cookieStore = await cookies();
    cookieStore.set("user_data", JSON.stringify(userData), {
        httpOnly: true,
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
        try {
            return JSON.parse(userData);
        } catch {
            return null;
        }
    }
    return null;
}

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("user_data");
};

export const setGoogleState = async (state: string) => {
    const cookieStore = await cookies();
    cookieStore.set("google_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
    });
}

export const getGoogleState = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("google_state")?.value || null;
}

export const clearGoogleState = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("google_state");
};

export const setTwoFactorChallenge = async (challengeToken: string) => {
    const cookieStore = await cookies();
    cookieStore.set("twofa_challenge", challengeToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
    });
};

export const getTwoFactorChallenge = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("twofa_challenge")?.value || null;
};

export const clearTwoFactorChallenge = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("twofa_challenge");
};

export const setPasswordExpiredChallenge = async (expiredToken: string) => {
    const cookieStore = await cookies();
    cookieStore.set("password_expired", expiredToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
    });
};

export const getPasswordExpiredChallenge = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("password_expired")?.value || null;
};

export const clearPasswordExpiredChallenge = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("password_expired");
};
