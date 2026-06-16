"use server";

import { loginUser, registerUser, logoutUser } from "../api/auth";
import { setAuthToken, setUserData, clearAuthCookies } from "../cookie";

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
