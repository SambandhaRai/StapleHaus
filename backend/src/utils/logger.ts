import winston from "winston";
import { sendAlert } from "./alert";

const levels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
};

const colors = {
    fatal: "magenta",
    error: "red",
    warn: "yellow",
    info: "green",
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `[${info.timestamp}] [${info.level}]: ${info.message}${info.meta ? " " + JSON.stringify(info.meta) : ""}`
    )
);

const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const baseLogger = winston.createLogger({
    level: "info",
    levels,
    transports: [
        new winston.transports.Console({ format: consoleFormat }),
        new winston.transports.File({ filename: "logs/error.log", level: "error", format: fileFormat }),
        new winston.transports.File({ filename: "logs/combined.log", format: fileFormat }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: "logs/exceptions.log", format: fileFormat }),
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: "logs/rejections.log", format: fileFormat }),
    ],
});

export const logger = {
    info: (message: string, meta?: Record<string, unknown>) => baseLogger.info(message, { meta }),
    warn: (message: string, meta?: Record<string, unknown>) => baseLogger.warn(message, { meta }),
    error: (message: string, meta?: Record<string, unknown>) => {
        baseLogger.error(message, { meta });
        sendAlert("error", message, meta);
    },
    fatal: (message: string, meta?: Record<string, unknown>) => {
        baseLogger.log("fatal", message, { meta });
        sendAlert("fatal", message, meta);
    },
};
