import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { UserModel } from "../models/user.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/staplehaus";

const SEED_USERS = [
    {
        name: process.env.USER1_NAME || "Test User One",
        email: (process.env.USER1_EMAIL || "user1@staplehaus.local").toLowerCase(),
        password: process.env.USER1_PASSWORD || "",
    },
    {
        name: process.env.USER2_NAME || "Test User Two",
        email: (process.env.USER2_EMAIL || "user2@staplehaus.local").toLowerCase(),
        password: process.env.USER2_PASSWORD || "",
    },
];

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

async function seedUsers() {
    for (const user of SEED_USERS) {
        if (!user.password) {
            throw new Error(`Password must be set to seed user ${user.email}`);
        }
    }

    await connectWithRetry();

    for (const user of SEED_USERS) {
        const existing = await UserModel.findOne({ email: user.email });
        if (existing) {
            console.log(`User ${user.email} already exists, skipping`);
            continue;
        }

        const password = await bcryptjs.hash(user.password, 10);
        await UserModel.create({
            name: user.name,
            email: user.email,
            password,
            role: "customer",
            isEmailVerified: true,
        });
        console.log(`Seeded user ${user.email}`);
    }
}

seedUsers()
    .then(async () => {
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(async (error) => {
        console.error("User seed failed", error);
        await mongoose.disconnect();
        process.exit(1);
    });
