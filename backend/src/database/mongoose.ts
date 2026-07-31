import mongoose from "mongoose";
import { MONGODB_URI } from "../config";
import { logger } from "../utils/logger";
import { flushAlerts } from "../utils/alert";

type ConnectDatabaseOptions = {
    exitOnError?: boolean;
};

export async function connectDatabase(
    uri: string = MONGODB_URI,
    options: ConnectDatabaseOptions = {}
) {
    const { exitOnError = true } = options;
    try {
        // NoSQL injection prevention: with sanitizeFilter on, Mongoose wraps any
        // operator object an attacker sneaks into a query (e.g. a `password`
        // field submitted as {"$ne": null}) so it's treated as a literal value
        // to match, instead of being executed as a query operator.
        mongoose.set("sanitizeFilter", true);
        await mongoose.connect(uri);
        logger.info("Database connected successfully");
    } catch (error) {
        logger.fatal("Database connection failed", { error: String(error) });
        if (exitOnError) {
            await flushAlerts();
            process.exit(1);
        }
        throw error;
    }
}