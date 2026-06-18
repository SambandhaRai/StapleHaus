"use server";

import { randomUUID } from "crypto";
import { loginUser, registerUser, googleLogin, logoutUser } from "../api/auth";
import {
    setAuthToken,
    setUserData,
    clearAuthCookies,
    setGoogleNonce,
    getGoogleNonce,
    clearGoogleNonce,
} from "../cookie";

export const handleRegister = async (formData: any) => {
    try {
        const result = await registerUser(formData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Registration Successful"
            };
        }
        return {
            success: false,
            message: result.message || "Registration Failed"
        };
    } catch (err: Error | any) {
        console.log("HANDLE REGISTER ERROR:", err.message);
        return {
            success: false,
            message: err.message || "Registration Failed"
        };
    }
}

export const handleLogin = async (formData: any) => {
    try {
        const result = await loginUser(formData);
        if (result.success) {
            await setAuthToken(result.token);
            await setUserData(result.data);

            return {
                success: true,
                data: result.data,
                message: "Login Successful"
            };
        }
        return {
            success: false,
            message: result.message || "Login Failed"
        }
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Login Failed"
        };
    }
}

export const prepareGoogleSignIn = async () => {
    const nonce = `${randomUUID()}${randomUUID()}`;
    await setGoogleNonce(nonce);
    return nonce;
}

export const handleGoogleLogin = async (credential: string) => {
    try {
        const nonce = await getGoogleNonce();
        if (!nonce) {
            return {
                success: false,
                message: "Your Google sign-in expired, please try again"
            };
        }
        const result = await googleLogin(credential, nonce);
        await clearGoogleNonce();
        if (result.success) {
            await setAuthToken(result.token);
            await setUserData(result.data);

            return {
                success: true,
                data: result.data,
                message: "Login Successful"
            };
        }
        return {
            success: false,
            message: result.message || "Google Login Failed"
        };
    } catch (err: Error | any) {
        await clearGoogleNonce();
        return {
            success: false,
            message: err.message || "Google Login Failed"
        };
    }
}

export const handleLogout = async () => {
    try {
        await logoutUser();
        await clearAuthCookies();
        return {
            success: true,
            message: "Logout Successful"
        };
    } catch (err: Error | any) {
        await clearAuthCookies();
        return {
            success: false,
            message: err.message || "Logout Failed"
        };
    }
}
