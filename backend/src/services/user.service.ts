import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../models/user.model";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config";
import { RegisterUserDto, LoginUserDto, UpdateUserDto, CreateAddressDto, UpdateAddressDto } from "../dtos/user.dto";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

let userRepository = new UserRepository();

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

        const passwordHash = await bcryptjs.hash(data.password, 10);

        const newUser = await userRepository.createUser({
            name: data.name,
            email: data.email,
            passwordHash,
        });

        const token = this.createAuthToken(newUser);

        return { token, user: newUser };
    }

    async loginUser(data: LoginUserDto) {
        const existingUser = await userRepository.getUserByEmail(data.email);
        if (!existingUser) {
            throw new HttpError(401, "Invalid email or password");
        }

        const isPasswordMatch = await bcryptjs.compare(data.password, existingUser.passwordHash);
        if (!isPasswordMatch) {
            throw new HttpError(401, "Invalid email or password");
        }

        const token = this.createAuthToken(existingUser);

        return { token, user: existingUser };
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
