import axios from "axios";
import { headers } from "next/headers";
import { getAuthToken } from "../cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const axiosInstance = axios.create(
    {
        baseURL: BASE_URL,
    }
);

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await getAuthToken();
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            const requestHeaders = await headers();
            const userAgent = requestHeaders.get("user-agent");
            const forwardedFor = requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip");
            if (userAgent && config.headers) {
                config.headers["x-client-user-agent"] = userAgent;
            }
            if (forwardedFor && config.headers) {
                config.headers["x-forwarded-for"] = forwardedFor;
            }
        } catch {
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
