import dotenv from "dotenv";
dotenv.config();

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5050;
export const MONGODB_URI: string = process.env.MONGODB_URI || "mongodb://localhost:27017/staplehaus";
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random value of at least 32 characters");
}
export const JWT_SECRET: string = jwtSecret;
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "30d";
export const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:3000";
export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID || "";
export const TURNSTILE_SECRET: string = process.env.TURNSTILE_SECRET || "";
const twoFactorEncKey = process.env.TWO_FACTOR_ENC_KEY;
if (!twoFactorEncKey || !/^[0-9a-fA-F]{64}$/.test(twoFactorEncKey)) {
    throw new Error("TWO_FACTOR_ENC_KEY must be set to 64 hex characters (32 random bytes)");
}
export const TWO_FACTOR_ENC_KEY: string = twoFactorEncKey;
export const ESEWA_PRODUCT_CODE: string = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
export const ESEWA_SECRET: string = process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q";
export const ESEWA_FORM_URL: string = process.env.ESEWA_FORM_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
export const ESEWA_STATUS_URL: string = process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";
export const ALERT_EMAIL: string = process.env.ALERT_EMAIL || process.env.SMTP_USER || "";
