import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { TWO_FACTOR_ENC_KEY, JWT_SECRET } from "../config";

const resolveKey = (): Buffer => {
    if (TWO_FACTOR_ENC_KEY) {
        const key = Buffer.from(TWO_FACTOR_ENC_KEY, "hex");
        if (key.length === 32) {
            return key;
        }
    }
    return createHash("sha256").update(JWT_SECRET).digest();
};

const key = resolveKey();

export const encryptSecret = (plaintext: string): string => {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decryptSecret = (payload: string): string => {
    const [ivHex, tagHex, dataHex] = payload.split(":");
    if (!ivHex || !tagHex || !dataHex) {
        throw new Error("Malformed encrypted payload");
    }
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
    return decrypted.toString("utf8");
};
