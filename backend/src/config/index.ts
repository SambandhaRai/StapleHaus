import dotenv from "dotenv";
dotenv.config();

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5050;
export const MONGODB_URI: string = process.env.MONGODB_URI || "mongodb://localhost:27017/staplehaus";
export const JWT_SECRET: string = process.env.JWT_SECRET || "default_secret";
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "30d";
export const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:3000";