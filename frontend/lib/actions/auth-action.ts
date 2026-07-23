"use server";

import { loginUser, loginTwoFactor, changeExpiredPassword, registerUser, verifyOtp, resendOtp, googleStart, googleCallback, logoutUser, forgotPassword, resetPassword } from "../api/auth";
import {
    setAuthToken,
    clearAuthCookies,
    setGoogleState,
    getGoogleState,
    clearGoogleState,
    setTwoFactorChallenge,
    getTwoFactorChallenge,
    clearTwoFactorChallenge,
    setPasswordExpiredChallenge,
    getPasswordExpiredChallenge,
    clearPasswordExpiredChallenge,
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
        if (result.success && result.passwordExpired) {
            await setPasswordExpiredChallenge(result.expiredToken);
            return {
                success: true,
                passwordExpired: true,
                message: result.message || "Your password has expired"
            };
        }
        if (result.success) {
            await setAuthToken(result.token);

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
        if (result.success && result.passwordExpired) {
            await clearTwoFactorChallenge();
            await setPasswordExpiredChallenge(result.expiredToken);
            return {
                success: true,
                passwordExpired: true,
                message: result.message || "Your password has expired"
            };
        }
        if (result.success) {
            await setAuthToken(result.token);
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

export const handleChangeExpiredPassword = async (newPassword: string) => {
    try {
        const expiredToken = await getPasswordExpiredChallenge();
        if (!expiredToken) {
            return {
                success: false,
                message: "Your sign-in session expired, please sign in again"
            };
        }
        const result = await changeExpiredPassword(expiredToken, newPassword);
        if (result.success) {
            await clearPasswordExpiredChallenge();
            await setAuthToken(result.token);

            return {
                success: true,
                data: result.data,
                message: "Password updated successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Could not update password"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Could not update password"
        };
    }
}

export const startGoogleLogin = async () => {
    const result = await googleStart();
    await setGoogleState(result.data.state);
    return result.data.url as string;
}

export const completeGoogleLogin = async (code: string, state: string) => {
    try {
        const stateCookie = await getGoogleState();
        if (!stateCookie) {
            return {
                success: false,
                message: "Your Google sign-in expired, please try again"
            };
        }

        const result = await googleCallback(code, state, stateCookie);
        await clearGoogleState();

        if (result.success && result.twoFactorRequired) {
            await setTwoFactorChallenge(result.challengeToken);
            return {
                success: true,
                twoFactorRequired: true,
                message: "Enter your authentication code"
            };
        }
        if (result.success && result.passwordExpired) {
            await setPasswordExpiredChallenge(result.expiredToken);
            return {
                success: true,
                passwordExpired: true,
                message: result.message || "Your password has expired"
            };
        }
        if (result.success) {
            await setAuthToken(result.token);

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
        await clearGoogleState();
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
