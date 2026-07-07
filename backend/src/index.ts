import fs from "fs";
import path from "path";
import https from "https";
import app from "./app";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongoose";
import { logger } from "./utils/logger";
import { flushAlerts } from "./utils/alert";

async function start() {
    await connectDatabase();

    const key = fs.readFileSync(
        path.join(__dirname, "../certs/localhost-key.pem")
    );
    const cert = fs.readFileSync(
        path.join(__dirname, "../certs/localhost.pem")
    );


    https.createServer({ key, cert }, app).listen(PORT, () => {
        logger.info(`Server started`, { url: `https://localhost:${PORT}` });
    })
}
start().catch(async (error) => {
    logger.fatal("Server failed to start", { error: String(error) });
    await flushAlerts();
    process.exit(1);
});
