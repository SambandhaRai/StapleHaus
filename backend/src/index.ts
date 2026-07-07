import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import app from "./app";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongoose";
import { logger } from "./utils/logger";
import { flushAlerts } from "./utils/alert";

const KEY_PATH = path.join(__dirname, "../certs/localhost-key.pem");
const CERT_PATH = path.join(__dirname, "../certs/localhost.pem");

async function start() {
    await connectDatabase();

    if (fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)) {
        const key = fs.readFileSync(KEY_PATH);
        const cert = fs.readFileSync(CERT_PATH);
        https.createServer({ key, cert }, app).listen(PORT, () => {
            logger.info("Server started", { url: `https://localhost:${PORT}` });
        });
    } else {
        http.createServer(app).listen(PORT, () => {
            logger.info("Server started", { url: `http://localhost:${PORT}`, note: "no TLS certs found, running plain HTTP (expected behind a reverse proxy)" });
        });
    }
}
start().catch(async (error) => {
    logger.fatal("Server failed to start", { error: String(error) });
    await flushAlerts();
    process.exit(1);
});
