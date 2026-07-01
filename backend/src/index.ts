import fs from "fs";
import path from "path";
import https from "https";
import app from "./app";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongoose";

async function start() {
    await connectDatabase();

    const key = fs.readFileSync(
        path.join(__dirname, "../certs/localhost-key.pem")
    );
    const cert = fs.readFileSync(
        path.join(__dirname, "../certs/localhost.pem")
    );


    https.createServer({ key, cert }, app).listen(PORT, () => {
        console.log(`Server: https://localhost:${PORT}`);
    })
}
start().catch((error) => console.log(error));
