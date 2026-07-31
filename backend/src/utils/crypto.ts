import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { TWO_FACTOR_ENC_KEY } from "../config";

// Encryption at rest: sensitive fields (2FA secrets, address details) are
// stored encrypted rather than in plaintext, so a database dump/leak alone
// isn't enough to read them without this server-side key.
const key = Buffer.from(TWO_FACTOR_ENC_KEY, "hex");

// AES-256-GCM is authenticated encryption: a fresh random IV per value stops
// identical plaintexts from producing identical ciphertext, and the auth tag
// lets decryptSecret() detect if the ciphertext was tampered with.
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

const ADDRESS_ENCRYPTED_FIELDS = ["line1", "line2", "city", "state", "postalCode", "country", "phone"];

const looksEncrypted = (value: string): boolean => /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(value);

export const encryptAddress = <T extends Record<string, unknown>>(address: T): T => {
    const result: Record<string, unknown> = { ...address };
    for (const field of ADDRESS_ENCRYPTED_FIELDS) {
        const value = result[field];
        if (typeof value === "string" && value.length > 0 && !looksEncrypted(value)) {
            result[field] = encryptSecret(value);
        }
    }
    return result as T;
};

export const decryptAddress = <T extends Record<string, unknown>>(address: T): T => {
    const result: Record<string, unknown> = { ...address };
    for (const field of ADDRESS_ENCRYPTED_FIELDS) {
        const value = result[field];
        if (typeof value === "string" && looksEncrypted(value)) {
            try {
                result[field] = decryptSecret(value);
            } catch {
                result[field] = value;
            }
        }
    }
    return result as T;
};
