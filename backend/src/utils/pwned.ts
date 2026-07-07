import { createHash } from "crypto";
import { logger } from "./logger";

const HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range/";

export const isPasswordBreached = async (password: string): Promise<boolean> => {
    try {
        const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
        const prefix = sha1.slice(0, 5);
        const suffix = sha1.slice(5);

        const response = await fetch(`${HIBP_RANGE_URL}${prefix}`, {
            headers: { "Add-Padding": "true" },
        });
        if (!response.ok) {
            return false;
        }

        const body = await response.text();
        for (const line of body.split("\n")) {
            const [lineSuffix, count] = line.trim().split(":");
            if (lineSuffix === suffix && Number(count) > 0) {
                return true;
            }
        }
        return false;
    } catch (error) {
        logger.warn("Pwned password check failed, allowing password", { error: String(error) });
        return false;
    }
};
