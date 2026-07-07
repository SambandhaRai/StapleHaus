import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../models/user.model";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET, JWT_EXPIRES_IN, GOOGLE_CLIENT_ID, FRONTEND_URL } from "../config";
import { RegisterUserDto, LoginUserDto, UpdateUserDto, CreateAddressDto, UpdateAddressDto, VerifyOtpDto, ResendOtpDto, LoginTwoFactorDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from "../dtos/user.dto";
import { sendEmail } from "../config/email";
import { encryptSecret, decryptSecret } from "../utils/crypto";
import { ActivityLogService } from "./activity-log.service";
import { SessionService } from "./session.service";
import { RequestContext } from "../types/activity-log.type";
import { logger } from "../utils/logger";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { randomInt, randomBytes, createHash } from "crypto";
import { OAuth2Client } from "google-auth-library";
import * as OTPAuth from "otpauth";

const TWO_FACTOR_ISSUER = "StapleHaus";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_MS = 15 * 60 * 1000;
const PASSWORD_HISTORY_LIMIT = 5;
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;

const createTotp = (base32Secret: string, label?: string) =>
    new OTPAuth.TOTP({
        issuer: TWO_FACTOR_ISSUER,
        label: label || TWO_FACTOR_ISSUER,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(base32Secret),
    });

let userRepository = new UserRepository();
let activityLogService = new ActivityLogService();
let sessionService = new SessionService();
let googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const isDuplicateKeyError = (error: unknown) =>
    typeof error === "object"
    && error !== null
    && "code" in error
    && (error as { code?: unknown }).code === 11000;

export class UserService {

    private async createAuthToken(user: IUser, context: RequestContext): Promise<string> {
        const knownDevice = await sessionService.isKnownDevice(user._id.toString(), context.userAgent);
        const session = await sessionService.createSession(user._id.toString(), context);
        if (!knownDevice) {
            this.sendNewDeviceAlert(user.email, context);
        }
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
            purpose: "session",
        };
        const options: SignOptions = {
            expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
            jwtid: session._id.toString(),
        };
        return jwt.sign(payload, JWT_SECRET, options);
    }

    private createChallengeToken(user: IUser): string {
        return jwt.sign({ id: user._id, purpose: "2fa" }, JWT_SECRET, { expiresIn: "5m" });
    }

    private verifyTotp(encryptedSecret: string, code: string): boolean {
        if (!/^\d{6}$/.test(code)) {
            return false;
        }
        const totp = createTotp(decryptSecret(encryptedSecret));
        return totp.validate({ token: code, window: 1 }) !== null;
    }

    private generateBackupCodes(): string[] {
        return Array.from({ length: 10 }, () => randomBytes(5).toString("hex"));
    }

    private async consumeBackupCode(user: IUser, code: string): Promise<boolean> {
        const normalized = code.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!normalized || !user.twoFactorBackupCodes?.length) {
            return false;
        }
        for (const hash of user.twoFactorBackupCodes) {
            if (await bcryptjs.compare(normalized, hash)) {
                await userRepository.removeBackupCode(user._id.toString(), hash);
                return true;
            }
        }
        return false;
    }

    private brandedEmailHtml(kicker: string, title: string, body: string) {
        const font = "Helvetica, Arial, sans-serif";
        return `
        <body style="margin:0; padding:0; background-color:#f7f7f5;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f5;">
                <tr>
                    <td align="center" style="padding:40px 16px;">
                        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px; max-width:100%; background-color:#ffffff; border:1px solid #e4e4e0;">
                            <tr>
                                <td style="padding:24px 40px; border-bottom:1px solid #e4e4e0;">
                                    <span style="font-family:${font}; font-size:18px; font-weight:700; letter-spacing:2px; color:#111111;">STAPLEHAUS</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:40px;">
                                    <p style="margin:0 0 8px 0; font-family:${font}; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#76766f;">${kicker}</p>
                                    <h1 style="margin:0 0 16px 0; font-family:${font}; font-size:24px; font-weight:700; color:#111111;">${title}</h1>
                                    ${body}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:20px 40px; border-top:1px solid #e4e4e0;">
                                    <p style="margin:0; font-family:${font}; font-size:12px; color:#a6a6a0;">&copy; StapleHaus</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        `;
    }

    private otpEmailHtml(otp: string) {
        const font = "Helvetica, Arial, sans-serif";
        const body = `
            <p style="margin:0 0 28px 0; font-family:${font}; font-size:15px; line-height:1.6; color:#57574f;">
                Enter this code to finish setting up your StapleHaus account. It expires in 10 minutes.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td align="center" style="padding:20px 0; border:1px solid #111111; background-color:#fafafa;">
                        <span style="font-family:${font}; font-size:34px; font-weight:700; letter-spacing:12px; color:#111111;">${otp}</span>
                    </td>
                </tr>
            </table>
            <p style="margin:28px 0 0 0; font-family:${font}; font-size:13px; line-height:1.6; color:#a6a6a0;">
                Didn't request this? You can safely ignore this email.
            </p>
        `;
        return this.brandedEmailHtml("Verify your email", "Confirm your account", body);
    }

    private securityAlertHtml(title: string, intro: string, details: Array<[string, string]>) {
        const font = "Helvetica, Arial, sans-serif";
        const detailRows = details.map(([label, value]) => `
            <tr>
                <td style="padding:8px 0; font-family:${font}; font-size:13px; color:#76766f; width:120px;">${label}</td>
                <td style="padding:8px 0; font-family:${font}; font-size:13px; color:#111111;">${value}</td>
            </tr>
        `).join("");
        const body = `
            <p style="margin:0 0 20px 0; font-family:${font}; font-size:15px; line-height:1.6; color:#57574f;">${intro}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #e4e4e0;">
                ${detailRows}
            </table>
            <p style="margin:28px 0 0 0; font-family:${font}; font-size:13px; line-height:1.6; color:#a6a6a0;">
                If this was you, no action is needed. If not, change your password and review your active sessions immediately.
            </p>
        `;
        return this.brandedEmailHtml("Security alert", title, body);
    }

    private sendAccountLockedAlert(email: string) {
        const intro = "Your account has been temporarily locked for 15 minutes after too many failed sign-in attempts.";
        const html = this.securityAlertHtml("Account temporarily locked", intro, [["Time", new Date().toUTCString()]]);
        sendEmail(email, "Your StapleHaus account has been locked", html, `${intro} If this wasn't you, change your password once the lock expires.`)
            .catch((error) => logger.error("Failed to send account locked alert", { error: String(error) }));
    }

    private sendNewDeviceAlert(email: string, context: RequestContext) {
        const intro = "Your account was just signed in to from a device we haven't seen before.";
        const rows: Array<[string, string]> = [["Time", new Date().toUTCString()]];
        if (context.userAgent) rows.push(["Device", context.userAgent.slice(0, 200)]);
        if (context.ip) rows.push(["IP address", context.ip]);
        const html = this.securityAlertHtml("New device sign-in", intro, rows);
        sendEmail(email, "New sign-in to your StapleHaus account", html, `${intro} If this wasn't you, change your password and review your active sessions.`)
            .catch((error) => logger.error("Failed to send new device alert", { error: String(error) }));
    }

    private async issueOtp(user: IUser) {
        const otp = randomInt(100000, 1000000).toString();
        const otpHash = await bcryptjs.hash(otp, 10);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await userRepository.setOtp(user._id.toString(), otpHash, otpExpiresAt);
        await sendEmail(
            user.email,
            `${otp} is your StapleHaus verification code`,
            this.otpEmailHtml(otp),
            `Your StapleHaus verification code is ${otp}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
        );
    }

    async registerUser(data: RegisterUserDto, context: RequestContext = {}) {
        const existingUser = await userRepository.getUserByEmail(data.email);
        if (existingUser) {
            if (existingUser.isEmailVerified === false) {
                await this.issueOtp(existingUser);
            }
            return { user: null };
        }

        const password = await bcryptjs.hash(data.password, 10);

        let newUser: IUser;
        try {
            newUser = await userRepository.createUser({
                name: data.name,
                email: data.email,
                password,
                passwordChangedAt: new Date(),
            });
        } catch (error: unknown) {
            if (isDuplicateKeyError(error)) {
                return { user: null };
            }
            throw error;
        }

        try {
            await this.issueOtp(newUser);
        } catch (error) {
            await userRepository.deleteUserById(newUser._id.toString());
            throw error;
        }

        await activityLogService.record({
            ...context,
            action: "register",
            status: "success",
            userId: newUser._id.toString(),
            email: newUser.email,
        });

        return { user: newUser };
    }

    async verifyOtp(data: VerifyOtpDto, context: RequestContext = {}) {
        const user = await userRepository.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, "Account not found");
        }
        if (user.isEmailVerified) {
            throw new HttpError(400, "Invalid or expired verification code");
        }
        if (!user.otpHash || !user.otpExpiresAt) {
            throw new HttpError(400, "Invalid or expired verification code");
        }
        if (user.otpExpiresAt.getTime() < Date.now()) {
            throw new HttpError(400, "Invalid or expired verification code");
        }

        const isMatch = await bcryptjs.compare(data.otp, user.otpHash);
        if (!isMatch) {
            throw new HttpError(400, "Invalid or expired verification code");
        }

        const verifiedUser = await userRepository.markEmailVerified(user._id.toString());
        if (!verifiedUser) {
            throw new HttpError(500, "Unable to verify email");
        }

        await activityLogService.record({
            ...context,
            action: "otp_verify",
            status: "success",
            userId: verifiedUser._id.toString(),
            email: verifiedUser.email,
        });

        const token = await this.createAuthToken(verifiedUser, context);

        return { token, user: verifiedUser };
    }

    async resendOtp(data: ResendOtpDto, context: RequestContext = {}) {
        const user = await userRepository.getUserByEmail(data.email);
        if (!user || user.isEmailVerified) {
            return true;
        }

        await this.issueOtp(user);

        await activityLogService.record({
            ...context,
            action: "otp_resend",
            status: "success",
            userId: user._id.toString(),
            email: user.email,
        });

        return true;
    }

    async loginUser(data: LoginUserDto, context: RequestContext = {}) {
        const existingUser = await userRepository.getUserByEmail(data.email);
        if (!existingUser || !existingUser.password) {
            await activityLogService.record({
                ...context,
                action: "login_failed",
                status: "failure",
                email: data.email,
                reason: "unknown_account",
            });
            throw new HttpError(401, "Invalid email or password");
        }

        const userId = existingUser._id.toString();

        if (existingUser.lockUntil && existingUser.lockUntil.getTime() > Date.now()) {
            await activityLogService.record({
                ...context,
                action: "account_locked",
                status: "failure",
                userId,
                email: existingUser.email,
                reason: "locked",
            });
            throw new HttpError(429, "Account locked due to too many failed attempts. Please try again later.");
        }

        const isPasswordMatch = await bcryptjs.compare(data.password, existingUser.password);
        if (!isPasswordMatch) {
            const updated = await userRepository.incrementFailedLoginAttempts(userId);
            if (updated && updated.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
                await userRepository.lockAccount(userId, new Date(Date.now() + ACCOUNT_LOCK_MS));
                await activityLogService.record({
                    ...context,
                    action: "account_locked",
                    status: "failure",
                    userId,
                    email: existingUser.email,
                    reason: "too_many_attempts",
                });
                this.sendAccountLockedAlert(existingUser.email);
            } else {
                await activityLogService.record({
                    ...context,
                    action: "login_failed",
                    status: "failure",
                    userId,
                    email: existingUser.email,
                    reason: "bad_password",
                });
            }
            throw new HttpError(401, "Invalid email or password");
        }

        if (existingUser.isEmailVerified === false) {
            await activityLogService.record({
                ...context,
                action: "login_failed",
                status: "failure",
                userId,
                email: existingUser.email,
                reason: "email_unverified",
            });
            throw new HttpError(401, "Invalid email or password");
        }

        if (existingUser.failedLoginAttempts > 0 || existingUser.lockUntil) {
            await userRepository.resetFailedLoginAttempts(userId);
        }

        if (existingUser.twoFactorEnabled) {
            await activityLogService.record({
                ...context,
                action: "twofa_challenge",
                status: "success",
                userId,
                email: existingUser.email,
            });
            return { twoFactorRequired: true as const, challengeToken: this.createChallengeToken(existingUser) };
        }

        await activityLogService.record({
            ...context,
            action: "login",
            status: "success",
            userId,
            email: existingUser.email,
        });

        const token = await this.createAuthToken(existingUser, context);

        return { twoFactorRequired: false as const, token, user: existingUser };
    }

    async loginWithTwoFactor(data: LoginTwoFactorDto, context: RequestContext = {}) {
        let payload: { id?: string; purpose?: string };
        try {
            payload = jwt.verify(data.challengeToken, JWT_SECRET) as { id?: string; purpose?: string };
        } catch {
            throw new HttpError(401, "Your verification session expired, please sign in again");
        }

        if (payload.purpose !== "2fa" || !payload.id) {
            throw new HttpError(401, "Invalid verification session");
        }

        const user = await userRepository.getUserById(payload.id);
        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            throw new HttpError(401, "Invalid verification session");
        }

        const verified = this.verifyTotp(user.twoFactorSecret, data.code)
            || await this.consumeBackupCode(user, data.code);
        if (!verified) {
            await activityLogService.record({
                ...context,
                action: "login_failed",
                status: "failure",
                userId: user._id.toString(),
                email: user.email,
                reason: "bad_2fa_code",
            });
            throw new HttpError(401, "Invalid authentication code");
        }

        await activityLogService.record({
            ...context,
            action: "login",
            status: "success",
            userId: user._id.toString(),
            email: user.email,
            reason: "two_factor",
        });

        const token = await this.createAuthToken(user, context);

        return { token, user };
    }

    async setupTwoFactor(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "Account not found");
        }
        if (user.twoFactorEnabled) {
            throw new HttpError(400, "Two-factor authentication is already enabled");
        }

        const secret = new OTPAuth.Secret({ size: 20 });
        const totp = createTotp(secret.base32, user.email);
        await userRepository.setPendingTwoFactor(userId, encryptSecret(secret.base32));

        return { otpauthUri: totp.toString(), secret: secret.base32 };
    }

    async enableTwoFactor(userId: string, code: string, context: RequestContext = {}) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "Account not found");
        }
        if (user.twoFactorEnabled) {
            throw new HttpError(400, "Two-factor authentication is already enabled");
        }
        if (!user.twoFactorPendingSecret) {
            throw new HttpError(400, "Start two-factor setup first");
        }
        if (!this.verifyTotp(user.twoFactorPendingSecret, code)) {
            throw new HttpError(400, "Invalid authentication code");
        }

        const backupCodes = this.generateBackupCodes();
        const backupCodeHashes = await Promise.all(backupCodes.map((c) => bcryptjs.hash(c, 10)));
        await userRepository.activateTwoFactor(userId, user.twoFactorPendingSecret, backupCodeHashes);
        await sessionService.revokeOtherSessions(userId, context.sessionId);

        await activityLogService.record({
            ...context,
            action: "twofa_enable",
            status: "success",
            userId,
            email: user.email,
        });

        return { backupCodes };
    }

    async disableTwoFactor(userId: string, password: string, context: RequestContext = {}) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "Account not found");
        }
        if (!user.twoFactorEnabled) {
            throw new HttpError(400, "Two-factor authentication is not enabled");
        }
        if (!user.password || !(await bcryptjs.compare(password, user.password))) {
            await activityLogService.record({
                ...context,
                action: "twofa_disable",
                status: "failure",
                userId,
                email: user.email,
                reason: "bad_password",
            });
            throw new HttpError(401, "Incorrect password");
        }

        await userRepository.disableTwoFactor(userId);
        await sessionService.revokeOtherSessions(userId, context.sessionId);

        await activityLogService.record({
            ...context,
            action: "twofa_disable",
            status: "success",
            userId,
            email: user.email,
        });

        return true;
    }

    private async verifyGoogleToken(idToken: string, expectedNonce: string) {
        if (!GOOGLE_CLIENT_ID) {
            throw new HttpError(500, "Google sign-in is not configured");
        }

        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
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
        if (!payload.email_verified) {
            throw new HttpError(401, "Google email is not verified");
        }
        if (!expectedNonce || payload.nonce !== expectedNonce) {
            throw new HttpError(401, "Google sign-in could not be verified, please try again");
        }

        return { email: payload.email, name: payload.name, googleId: payload.sub };
    }

    async loginWithGoogle(idToken: string, expectedNonce: string, context: RequestContext = {}) {
        const profile = await this.verifyGoogleToken(idToken, expectedNonce);

        let user = await userRepository.getUserByGoogleId(profile.googleId);
        if (!user) {
            user = await userRepository.getUserByEmail(profile.email);
            if (user) {
                if (user.googleId && user.googleId !== profile.googleId) {
                    throw new HttpError(409, "This email is already linked to another Google account");
                }

                user = await userRepository.linkGoogleAccount(user._id.toString(), profile.googleId);
            } else {
                try {
                    user = await userRepository.createUser({
                        name: profile.name || profile.email.split("@")[0],
                        email: profile.email,
                        googleId: profile.googleId,
                        isEmailVerified: true,
                    });
                } catch (error: unknown) {
                    if (!isDuplicateKeyError(error)) {
                        throw error;
                    }
                    user = await userRepository.getUserByGoogleId(profile.googleId)
                        ?? await userRepository.getUserByEmail(profile.email);
                }
            }
        }

        if (!user) {
            throw new HttpError(500, "Unable to sign in with Google");
        }

        await activityLogService.record({
            ...context,
            action: "google_login",
            status: "success",
            userId: user._id.toString(),
            email: user.email,
        });

        const token = await this.createAuthToken(user, context);

        return { token, user };
    }

    async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUser(userId: string, data: UpdateUserDto) {
        const updatedUser = await userRepository.updateOneUser(userId, data);
        if (!updatedUser) {
            throw new HttpError(404, "User not found");
        }
        return updatedUser;
    }

    private resetPasswordEmailHtml(resetLink: string) {
        const font = "Helvetica, Arial, sans-serif";
        const body = `
            <p style="margin:0 0 28px 0; font-family:${font}; font-size:15px; line-height:1.6; color:#57574f;">
                We received a request to reset your StapleHaus password. Click the button below to choose a new one. This link expires in 15 minutes and can only be used once.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td align="center">
                        <a href="${resetLink}" style="font-family:${font}; font-size:15px; font-weight:700; color:#ffffff; background-color:#111111; text-decoration:none; padding:14px 32px; display:inline-block;">Reset password</a>
                    </td>
                </tr>
            </table>
            <p style="margin:28px 0 0 0; font-family:${font}; font-size:13px; line-height:1.6; color:#a6a6a0;">
                Didn't request this? You can safely ignore this email — your password will stay the same.
            </p>
        `;
        return this.brandedEmailHtml("Password reset", "Reset your password", body);
    }

    async requestPasswordReset(data: ForgotPasswordDto, context: RequestContext = {}) {
        const user = await userRepository.getUserByEmail(data.email);
        if (!user || !user.password || user.isEmailVerified === false) {
            await activityLogService.record({
                ...context,
                action: "password_reset_request",
                status: "failure",
                email: data.email,
                reason: "unknown_or_ineligible_account",
            });
            return true;
        }

        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(token).digest("hex");
        await userRepository.setPasswordResetToken(user._id.toString(), tokenHash, new Date(Date.now() + PASSWORD_RESET_TTL_MS));

        const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
        await sendEmail(
            user.email,
            "Reset your StapleHaus password",
            this.resetPasswordEmailHtml(resetLink),
            `We received a request to reset your StapleHaus password. Open this link to choose a new one (expires in 15 minutes): ${resetLink}. If you didn't request this, you can ignore this email.`,
        );

        await activityLogService.record({
            ...context,
            action: "password_reset_request",
            status: "success",
            userId: user._id.toString(),
            email: user.email,
        });

        return true;
    }

    async resetPassword(data: ResetPasswordDto, context: RequestContext = {}) {
        const tokenHash = createHash("sha256").update(data.token).digest("hex");
        const user = await userRepository.getUserByResetTokenHash(tokenHash);

        if (!user || !user.password || !user.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() < Date.now()) {
            await activityLogService.record({
                ...context,
                action: "password_reset",
                status: "failure",
                userId: user?._id.toString(),
                email: user?.email,
                reason: "invalid_or_expired_token",
            });
            throw new HttpError(400, "This reset link is invalid or has expired. Please request a new one.");
        }

        const userId = user._id.toString();

        const previousHashes = [user.password, ...(user.passwordHistory ?? [])];
        for (const hash of previousHashes) {
            if (await bcryptjs.compare(data.password, hash)) {
                throw new HttpError(400, "You cannot reuse a recent password. Please choose a different one.");
            }
        }

        const newHash = await bcryptjs.hash(data.password, 10);
        const nextHistory = previousHashes.slice(0, PASSWORD_HISTORY_LIMIT);
        await userRepository.updatePassword(userId, newHash, nextHistory, new Date());
        await userRepository.clearPasswordResetToken(userId);
        await userRepository.resetFailedLoginAttempts(userId);
        await sessionService.revokeAllSessions(userId);

        await activityLogService.record({
            ...context,
            action: "password_reset",
            status: "success",
            userId,
            email: user.email,
        });

        return true;
    }

    async changePassword(userId: string, data: ChangePasswordDto, context: RequestContext = {}) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if (!user.password) {
            throw new HttpError(400, "Password change is not available for this account");
        }

        if (!(await bcryptjs.compare(data.currentPassword, user.password))) {
            await activityLogService.record({
                ...context,
                action: "password_change",
                status: "failure",
                userId,
                email: user.email,
                reason: "bad_current_password",
            });
            throw new HttpError(401, "Current password is incorrect");
        }

        const previousHashes = [user.password, ...(user.passwordHistory ?? [])];
        for (const hash of previousHashes) {
            if (await bcryptjs.compare(data.newPassword, hash)) {
                throw new HttpError(400, "You cannot reuse a recent password. Please choose a different one.");
            }
        }

        const newHash = await bcryptjs.hash(data.newPassword, 10);
        const nextHistory = [user.password, ...(user.passwordHistory ?? [])].slice(0, PASSWORD_HISTORY_LIMIT);
        await userRepository.updatePassword(userId, newHash, nextHistory, new Date());

        await sessionService.revokeOtherSessions(userId, context.sessionId);

        await activityLogService.record({
            ...context,
            action: "password_change",
            status: "success",
            userId,
            email: user.email,
        });

        return true;
    }

    async addAddress(userId: string, address: CreateAddressDto) {
        const updatedUser = await userRepository.addAddress(userId, address);
        if (!updatedUser) {
            throw new HttpError(404, "User not found");
        }
        return updatedUser;
    }

    async updateAddress(userId: string, addressId: string, patch: UpdateAddressDto) {
        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            throw new HttpError(400, "Invalid address ID");
        }
        const updatedUser = await userRepository.updateAddress(userId, addressId, patch);
        if (!updatedUser) {
            throw new HttpError(404, "Address not found");
        }
        return updatedUser;
    }

    async deleteAddress(userId: string, addressId: string) {
        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            throw new HttpError(400, "Invalid address ID");
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const exists = user.addresses.some(a => a._id.toString() === addressId);
        if (!exists) {
            throw new HttpError(404, "Address not found");
        }

        return await userRepository.removeAddress(userId, addressId);
    }
}
