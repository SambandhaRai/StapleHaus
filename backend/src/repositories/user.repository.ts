import { IUser, UserModel } from "../models/user.model";
import { AddressType, UserRoleType } from "../types/user.type";

type CreateUserData = {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role?: UserRoleType;
    isEmailVerified?: boolean;
};

type UpdateUserData = {
    name?: string;
    googleId?: string;
};

export interface IUserRepository {
    createUser(data: CreateUserData): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByGoogleId(googleId: string): Promise<IUser | null>;
    updateOneUser(id: string, data: UpdateUserData): Promise<IUser | null>;
    linkGoogleAccount(userId: string, googleId: string): Promise<IUser | null>;
    setOtp(userId: string, otpHash: string, otpExpiresAt: Date): Promise<IUser | null>;
    markEmailVerified(userId: string): Promise<IUser | null>;
    deleteUserById(userId: string): Promise<IUser | null>;

    addAddress(userId: string, address: AddressType): Promise<IUser | null>;
    updateAddress(userId: string, addressId: string, patch: Partial<AddressType>): Promise<IUser | null>;
    removeAddress(userId: string, addressId: string): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {

    async createUser(data: CreateUserData): Promise<IUser> {
        return await UserModel.create(data);
    }

    async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findById(id);
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email });
    }

    async getUserByGoogleId(googleId: string): Promise<IUser | null> {
        return await UserModel.findOne({ googleId });
    }

    async updateOneUser(id: string, data: UpdateUserData): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
    }

    async linkGoogleAccount(userId: string, googleId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { googleId },
            { returnDocument: "after" }
        );
    }

    async setOtp(userId: string, otpHash: string, otpExpiresAt: Date): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { otpHash, otpExpiresAt },
            { returnDocument: "after" }
        );
    }

    async markEmailVerified(userId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { isEmailVerified: true, $unset: { otpHash: "", otpExpiresAt: "" } },
            { returnDocument: "after" }
        );
    }

    async deleteUserById(userId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndDelete(userId);
    }

    async addAddress(userId: string, address: AddressType): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { $push: { addresses: address } },
            { returnDocument: "after" }
        );
    }

    async updateAddress(userId: string, addressId: string, patch: Partial<AddressType>): Promise<IUser | null> {
        const setFields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(patch)) {
            setFields[`addresses.$.${key}`] = value;
        }

        return await UserModel.findOneAndUpdate(
            { _id: userId, "addresses._id": addressId },
            { $set: setFields },
            { returnDocument: "after" }
        );
    }

    async removeAddress(userId: string, addressId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { $pull: { addresses: { _id: addressId } } },
            { returnDocument: "after" }
        );
    }
}
