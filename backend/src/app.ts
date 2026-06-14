import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
console.log(process.env.PORT);

const app: Application = express();

app.use(bodyParser.json());

export default app;