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
