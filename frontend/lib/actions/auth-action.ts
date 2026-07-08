"use server";

import { randomUUID } from "crypto";
import { loginUser, loginTwoFactor, registerUser, verifyOtp, resendOtp, googleLogin, logoutUser, forgotPassword, resetPassword } from "../api/auth";
import {
    setAuthToken,
    setUserData,
    clearAuthCookies,
    setGoogleNonce,
    getGoogleNonce,
    clearGoogleNonce,
    setTwoFactorChallenge,
    getTwoFactorChallenge,
    clearTwoFactorChallenge,
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

export const handleVerifyOtp = async (email: string, otp: string) => {
    try {
        const result = await verifyOtp(email, otp);
        if (result.success) {
            await setAuthToken(result.token);
            await setUserData(result.data);

            return {
                success: true,
                data: result.data,
                message: "Email Verified"
            };
        }
        return {
            success: false,
            message: result.message || "Verification Failed"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Verification Failed"
        };
    }
}

export const handleResendOtp = async (email: string, captchaToken: string) => {
    try {
        const result = await resendOtp(email, captchaToken);
        return {
            success: Boolean(result.success),
            message: result.message || "A new code has been sent"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Could not resend code"
        };
    }
}

export const handleLogin = async (formData: any) => {
    try {
        const result = await loginUser(formData);
        if (result.success && result.twoFactorRequired) {
            await setTwoFactorChallenge(result.challengeToken);
            return {
                success: true,
                twoFactorRequired: true,
                message: "Enter your authentication code"
            };
        }
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

export const handleVerifyLoginTwoFactor = async (code: string) => {
    try {
        const challengeToken = await getTwoFactorChallenge();
        if (!challengeToken) {
            return {
                success: false,
                message: "Your sign-in session expired, please sign in again"
            };
        }
        const result = await loginTwoFactor(challengeToken, code);
        if (result.success) {
            await setAuthToken(result.token);
            await setUserData(result.data);
            await clearTwoFactorChallenge();

            return {
                success: true,
                data: result.data,
                message: "Login Successful"
            };
        }
        return {
            success: false,
            message: result.message || "Login Failed"
        };
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

export const handleForgotPassword = async (email: string, captchaToken: string) => {
    try {
        const result = await forgotPassword(email, captchaToken);
        return {
            success: Boolean(result.success),
            message: result.message || "If an account exists for that email, a reset link has been sent"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Could not send reset link"
        };
    }
}

export const handleResetPassword = async (token: string, password: string) => {
    try {
        const result = await resetPassword(token, password);
        return {
            success: Boolean(result.success),
            message: result.message || "Password reset successfully"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Password reset failed"
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
