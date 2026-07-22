import { OAuth2Client } from "google-auth-library";
import { HttpError } from "../errors/http-error";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

const OAUTH_STATE_TTL = "5m";

export type GoogleIdentity = {
    googleId: string;
    email: string;
    emailVerified: boolean;
    name: string;
};

export class GoogleService {

    isConfigured(): boolean {
        return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
    }

    private getClient(): OAuth2Client {
        if (!this.isConfigured()) {
            throw new HttpError(503, "Google sign-in is not configured on this server");
        }
        return new OAuth2Client({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            redirectUri: GOOGLE_CALLBACK_URL,
        });
    }

    createStateToken(): string {
        const nonce = randomBytes(16).toString("hex");
        return jwt.sign({ nonce, purpose: "oauth_state" }, JWT_SECRET, { expiresIn: OAUTH_STATE_TTL });
    }

    verifyStateToken(state: string): void {
        let payload;
        try {
            payload = jwt.verify(state, JWT_SECRET) as { purpose?: string };
        } catch {
            throw new HttpError(400, "Your Google sign-in took too long, please try again");
        }
        if (payload.purpose !== "oauth_state") {
            throw new HttpError(400, "Google sign-in could not be verified, please try again");
        }
    }

    getAuthUrl(state: string): string {
        return this.getClient().generateAuthUrl({
            scope: ["openid", "email", "profile"],
            state,
            access_type: "online",
            prompt: "select_account",
        });
    }

    async exchangeCode(code: string): Promise<GoogleIdentity> {
        const client = this.getClient();

        let idToken: string | null | undefined;
        try {
            const { tokens } = await client.getToken(code);
            idToken = tokens.id_token;
        } catch {
            throw new HttpError(401, "Google sign-in failed, please try again");
        }

        if (!idToken) {
            throw new HttpError(401, "Google sign-in failed, please try again");
        }

        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch {
            throw new HttpError(401, "Invalid Google credential");
        }

        if (!payload || !payload.email || !payload.sub) {
            throw new HttpError(401, "Invalid Google credential");
        }

        return {
            googleId: payload.sub,
            email: payload.email,
            emailVerified: payload.email_verified === true,
            name: payload.name || payload.email.split("@")[0],
        };
    }
}
