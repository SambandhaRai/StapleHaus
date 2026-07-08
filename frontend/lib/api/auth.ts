import axios from "./axios";
import { API } from "./endpoints";

export const registerUser = async (registerData: any) => {
    try {
        const response = await axios.post(
            API.AUTH.REGISTER,
            registerData
        );
        return response.data;
    } catch (err: Error | any) {
        console.log("REGISTER ERROR:", err.response?.data);
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Registration Failed"
        );
    }
}

export const loginUser = async (loginData: any) => {
    try {
        const response = await axios.post(
            API.AUTH.LOGIN,
            loginData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Login Failed"
        );
    }
}

export const loginTwoFactor = async (challengeToken: string, code: string) => {
    try {
        const response = await axios.post(
            API.AUTH.LOGIN_2FA,
            { challengeToken, code }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Login Failed"
        );
    }
}

export const verifyOtp = async (email: string, otp: string) => {
    try {
        const response = await axios.post(
            API.AUTH.VERIFY_OTP,
            { email, otp }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Verification Failed"
        );
    }
}

export const resendOtp = async (email: string, captchaToken: string) => {
    try {
        const response = await axios.post(
            API.AUTH.RESEND_OTP,
            { email, captchaToken }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Could not resend code"
        );
    }
}

export const googleLogin = async (credential: string, nonce: string) => {
    try {
        const response = await axios.post(
            API.AUTH.GOOGLE,
            { credential, nonce }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Google Login Failed"
        );
    }
}

export const forgotPassword = async (email: string, captchaToken: string) => {
    try {
        const response = await axios.post(
            API.AUTH.FORGOT_PASSWORD,
            { email, captchaToken }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Could not send reset link"
        );
    }
}

export const resetPassword = async (token: string, password: string) => {
    try {
        const response = await axios.post(
            API.AUTH.RESET_PASSWORD,
            { token, password }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Password reset failed"
        );
    }
}

export const logoutUser = async () => {
    try {
        const response = await axios.post(
            API.AUTH.LOGOUT
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Logout Failed"
        );
    }
}
