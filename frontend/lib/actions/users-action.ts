"use server";

import { addAddress, getProfile, setupTwoFactor, enableTwoFactor, disableTwoFactor, type AddressPayload } from "../api/users";
import { setUserData } from "../cookie";

const getActionErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
};

export const handleGetProfile = async () => {
    try {
        return await getProfile();
    } catch (err: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to load profile"),
        };
    }
};

export const handleAddAddress = async (address: AddressPayload) => {
    try {
        const result = await addAddress(address);
        if (result.success) {
            await setUserData(result.data);
            return {
                success: true,
                data: result.data,
                message: result.message || "Address added",
            };
        }
        return {
            success: false,
            message: result.message || "Failed to add address",
        };
    } catch (err: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to add address"),
        };
    }
};

export const handleSetupTwoFactor = async () => {
    try {
        const result = await setupTwoFactor();
        return {
            success: Boolean(result.success),
            data: result.data,
            message: result.message,
        };
    } catch (err: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to start two-factor setup"),
        };
    }
};

export const handleEnableTwoFactor = async (token: string) => {
    try {
        const result = await enableTwoFactor(token);
        return {
            success: Boolean(result.success),
            data: result.data,
            message: result.message,
        };
    } catch (err: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to enable two-factor authentication"),
        };
    }
};

export const handleDisableTwoFactor = async (password: string) => {
    try {
        const result = await disableTwoFactor(password);
        return {
            success: Boolean(result.success),
            message: result.message,
        };
    } catch (err: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to disable two-factor authentication"),
        };
    }
};
