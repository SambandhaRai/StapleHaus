const encoder = new TextEncoder();

const getSecret = (): string => {
    const secret = process.env.CSRF_SECRET;
    if (secret && secret.length >= 32) return secret;
    if (process.env.NODE_ENV === "production") {
        throw new Error("CSRF_SECRET must be set to at least 32 characters in production");
    }
    return "staplehaus-development-only-csrf-secret-do-not-use-in-production";
};

let keyPromise: Promise<CryptoKey> | null = null;

const getKey = (): Promise<CryptoKey> => {
    if (!keyPromise) {
        keyPromise = crypto.subtle.importKey(
            "raw",
            encoder.encode(getSecret()),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
    }
    return keyPromise;
};

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

const sign = async (nonce: string): Promise<string> => {
    const key = await getKey();
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(nonce));
    return toHex(signature);
};

// Constant-time comparison: a normal `===` returns as soon as it finds a
// mismatched character, so comparison time leaks how many leading characters
// were correct. XOR-ing every character regardless of an early mismatch keeps
// the comparison time the same either way, closing that timing side channel.
export const timingSafeEqual = (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
};

// Token is a random nonce PLUS an HMAC signature over it, not just a random
// value, so a token can be verified as genuinely server-issued (via
// verifyCsrfToken) even without a database lookup, and can't be forged
// without knowing CSRF_SECRET.
export const generateCsrfToken = async (): Promise<string> => {
    const nonceBytes = new Uint8Array(32);
    crypto.getRandomValues(nonceBytes);
    const nonce = toHex(nonceBytes.buffer);
    const signature = await sign(nonce);
    return `${nonce}.${signature}`;
};

export const verifyCsrfToken = async (token?: string): Promise<boolean> => {
    if (!token) return false;
    const separator = token.indexOf(".");
    if (separator <= 0 || separator === token.length - 1) return false;
    const nonce = token.slice(0, separator);
    const signature = token.slice(separator + 1);
    const expected = await sign(nonce);
    return timingSafeEqual(signature, expected);
};
