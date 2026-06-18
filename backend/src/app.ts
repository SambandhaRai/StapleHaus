import express, { Application, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import multer from "multer";
import path from "path";
import { FRONTEND_URL } from "./config";
import { allowedImageMessage } from "./middlewares/upload.middleware";

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

const app: Application = express();

app.set("query parser", "simple");

const allowedOrigins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
].filter(Boolean);

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
    credentials: true,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
