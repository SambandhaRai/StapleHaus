import type { AxiosError } from "axios";
import axios from "./axios";
import { API } from "./endpoints";

export type AddressPayload = {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone: string;
};

type ApiErrorResponse = {
    message?: string;
};

const getApiErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const getProfile = async () => {
    try {
        const response = await axios.get(API.USER.GET_PROFILE);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to load profile"));
    }
};

export const addAddress = async (address: AddressPayload) => {
    try {
        const response = await axios.post(API.USER.ADD_ADDRESS, address);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to add address"));
    }
};

export const setupTwoFactor = async () => {
    try {
        const response = await axios.post(API.USER.TWO_FACTOR_SETUP);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to start two-factor setup"));
    }
};

export const enableTwoFactor = async (token: string) => {
    try {
        const response = await axios.post(API.USER.TWO_FACTOR_ENABLE, { token });
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to enable two-factor authentication"));
    }
};

export const disableTwoFactor = async (password: string) => {
    try {
        const response = await axios.post(API.USER.TWO_FACTOR_DISABLE, { password });
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to disable two-factor authentication"));
    }
};
