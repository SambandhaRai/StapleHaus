import express, { Application, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import multer from "multer";
import path from "path";
import { FRONTEND_URL } from "./config";
import { allowedImageMessage } from "./middlewares/upload.middleware";
import { ipAccessMiddleware } from "./middlewares/ip-access.middleware";
import { globalLimiter } from "./middlewares/rate-limit.middleware";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import brandRoutes from "./routes/brand.routes";
import categoryRoutes from "./routes/category.routes";
import cartRoutes from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import orderRoutes from "./routes/order.routes";
import reviewRoutes from "./routes/review.routes";
import discountRoutes from "./routes/discount.routes";
import activityRoutes from "./routes/activity.routes";
import ipAccessRoutes from "./routes/ip-access.routes";

const app: Application = express();

// NoSQL injection prevention: Express's default "extended" query parser turns
// bracket syntax like ?field[$ne]=x into a nested object, which is exactly the
// shape a NoSQL operator injection needs. The "simple" parser never builds
// that nested structure, so query-string operator injection has no way in.
app.set("query parser", "simple");

// helmet sets a batch of security response headers (CSP, X-Content-Type-Options,
// X-Frame-Options/frame-ancestors, HSTS, etc.), which is defense-in-depth against
// XSS, clickjacking, and MIME-sniffing attacks even when the app-level fixes below hold.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = [
    FRONTEND_URL,
    "https://localhost:3000",
    "https://localhost:3001",
    "https://127.0.0.1:3000",
].filter(Boolean);

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const getHeaderOrigin = (value?: string) => {
    if (!value) return null;
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
};

// CORS allow-list: only the known frontend origins can read cross-origin
// responses from the browser. Requests from any other site are rejected here
// before they reach a route handler.
const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// CSRF defense-in-depth for the Bearer-token API: browsers still send Origin/
// Referer on state-changing requests even when the CORS check above can be
// spoofed by non-browser clients, so this independently blocks any
// POST/PUT/PATCH/DELETE whose Origin (or Referer, as a fallback) isn't one of
// our own frontends, regardless of what CORS decided.
app.use((req: Request, res: Response, next: NextFunction) => {
    if (!unsafeMethods.has(req.method)) {
        next();
        return;
    }

    const requestOrigin = getHeaderOrigin(req.get("origin")) ?? getHeaderOrigin(req.get("referer"));
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        next();
        return;
    }

    res.status(403).json({ success: false, message: "Request origin is not allowed" });
});

app.use(ipAccessMiddleware);
app.use(globalLimiter);

// Caps request body size so a malicious or malformed oversized payload can't
// be used to exhaust server memory (a basic denial-of-service guard).
app.use(bodyParser.json({ limit: "100kb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
    },
}));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use("/api", orderRoutes);
app.use("/api", reviewRoutes);
app.use("/api", discountRoutes);
app.use("/api", activityRoutes);
app.use("/api", ipAccessRoutes);

app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
    if (error instanceof multer.MulterError) {
        const message = error.code === "LIMIT_FILE_SIZE"
            ? "Image files must be 5 MB or smaller"
            : error.message;

        return res.status(400).json({ success: false, message });
    }

    if (error.message === allowedImageMessage) {
        return res.status(400).json({ success: false, message: error.message });
    }

    next(error);
});

app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
