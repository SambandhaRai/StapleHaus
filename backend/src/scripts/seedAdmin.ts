import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { UserModel } from "../models/user.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/staplehaus";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@staplehaus.local").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

async function connectWithRetry(attempts = 10, delayMs = 3000) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            await mongoose.connect(MONGODB_URI);
            return;
        } catch (error) {
            if (attempt === attempts) throw error;
            console.log(`Mongo not ready (attempt ${attempt}/${attempts}), retrying in ${delayMs}ms`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
}

async function seedAdmin() {
    if (!ADMIN_PASSWORD) {
        throw new Error("ADMIN_PASSWORD must be set to seed the admin account");
    }

    await connectWithRetry();

    const existing = await UserModel.findOne({ email: ADMIN_EMAIL });
    if (existing) {
        if (existing.role !== "admin") {
            existing.role = "admin";
            await existing.save();
            console.log(`Promoted existing user ${ADMIN_EMAIL} to admin`);
        } else {
            console.log(`Admin ${ADMIN_EMAIL} already exists, skipping`);
        }
        return;
    }

    const password = await bcryptjs.hash(ADMIN_PASSWORD, 10);
    await UserModel.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password,
        role: "admin",
        isEmailVerified: true,
    });
    console.log(`Seeded admin ${ADMIN_EMAIL}`);
}

seedAdmin()
    .then(async () => {
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(async (error) => {
        console.error("Admin seed failed", error);
        await mongoose.disconnect();
        process.exit(1);
    });
