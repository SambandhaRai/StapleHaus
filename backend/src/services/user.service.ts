import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../models/user.model";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET, JWT_EXPIRES_IN, GOOGLE_CLIENT_ID } from "../config";
import { RegisterUserDto, LoginUserDto, UpdateUserDto, CreateAddressDto, UpdateAddressDto } from "../dtos/user.dto";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

let userRepository = new UserRepository();
let googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export class UserService {

    private createAuthToken(user: IUser): string {
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
        };
        const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] };
        return jwt.sign(payload, JWT_SECRET, options);
    }

    async registerUser(data: RegisterUserDto) {
        const existingUser = await userRepository.getUserByEmail(data.email);
        if (existingUser) {
            throw new HttpError(409, "Email is already in use");
        }

        const password = await bcryptjs.hash(data.password, 10);

        const newUser = await userRepository.createUser({
            name: data.name,
            email: data.email,
            password,
        });

        const token = this.createAuthToken(newUser);

        return { token, user: newUser };
    }

    async loginUser(data: LoginUserDto) {
        const existingUser = await userRepository.getUserByEmail(data.email);
        if (!existingUser || !existingUser.password) {
            throw new HttpError(401, "Invalid email or password");
        }

        const isPasswordMatch = await bcryptjs.compare(data.password, existingUser.password);
        if (!isPasswordMatch) {
            throw new HttpError(401, "Invalid email or password");
        }

        const token = this.createAuthToken(existingUser);

        return { token, user: existingUser };
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

    async loginWithGoogle(idToken: string, expectedNonce: string) {
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
                    });
                } catch (error: any) {
                    if (error?.code !== 11000) {
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

        const token = this.createAuthToken(user);

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
