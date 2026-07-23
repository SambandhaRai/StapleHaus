const encoder = new TextEncoder();
const decoder = new TextDecoder();

const getSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET must be set to at least 32 characters");
    }
    return secret;
};

let keyPromise: Promise<CryptoKey> | null = null;

const getKey = (): Promise<CryptoKey> => {
    if (!keyPromise) {
        keyPromise = crypto.subtle.importKey(
            "raw",
            encoder.encode(getSecret()),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );
    }
    return keyPromise;
};

const base64UrlDecode = (input: string): ArrayBuffer => {
    let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const remainder = base64.length % 4;
    if (remainder) base64 += "=".repeat(4 - remainder);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

export interface SessionTokenPayload {
    id: string;
    email: string;
    role: string;
    purpose?: string;
    jti?: string;
    exp?: number;
}

export const verifySessionToken = async (token?: string | null): Promise<SessionTokenPayload | null> => {
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerPart, payloadPart, signaturePart] = parts;

    try {
        const header = JSON.parse(decoder.decode(base64UrlDecode(headerPart))) as { alg?: string };
        if (header.alg !== "HS256") return null;

        const key = await getKey();
        const valid = await crypto.subtle.verify(
            "HMAC",
            key,
            base64UrlDecode(signaturePart),
            encoder.encode(`${headerPart}.${payloadPart}`)
        );
        if (!valid) return null;

        const payload = JSON.parse(decoder.decode(base64UrlDecode(payloadPart))) as SessionTokenPayload;
        if (payload.purpose !== "session") return null;
        if (payload.exp && payload.exp * 1000 <= Date.now()) return null;

        return payload;
    } catch {
        return null;
    }
};
