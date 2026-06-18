import dotenv from "dotenv";
dotenv.config();

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5050;
export const MONGODB_URI: string = process.env.MONGODB_URI || "mongodb://localhost:27017/staplehaus";
export const JWT_SECRET: string = process.env.JWT_SECRET || "default_secret";
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "30d";
export const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:3000";
export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID || "";
export const SMTP_USER: string = process.env.SMTP_USER || "";
export const SMTP_PASS: string = process.env.SMTP_PASS || "";
export const SMTP_FROM: string = process.env.SMTP_FROM || `StapleHaus <${process.env.SMTP_USER || "no-reply@staplehaus.com"}>`;

if (process.env.NODE_ENV === "production" && JWT_SECRET === "default_secret") {
    throw new Error("JWT_SECRET must be set to a strong, unique value in production");
}

if (process.env.NODE_ENV === "production" && !GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID must be set in production");
}
