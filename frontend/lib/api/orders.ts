import axios from "./axios";
import { API } from "./endpoints";

export const checkout = async (orderData: any) => {
    try {
        const response = await axios.post(
            API.ORDER.CHECKOUT,
            orderData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Checkout Failed"
        );
    }
}

export const verifyPayment = async (data: string) => {
    try {
        const response = await axios.post(
            API.ORDER.VERIFY_PAYMENT,
            { data }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Payment verification failed"
        );
    }
}

export const getMyOrders = async () => {
    try {
        const response = await axios.get(
            API.ORDER.GET_MY_ORDERS
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to load orders"
        );
    }
}

export const getOrderById = async (id: string) => {
    try {
        const response = await axios.get(
            API.ORDER.GET_BY_ID(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to load order"
        );
    }
}

export const getAllOrders = async () => {
    try {
        const response = await axios.get(
            API.ADMIN.ORDER.GET_ALL
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to load orders"
        );
    }
}

export const updateOrderStatus = async (id: string, orderStatus: string) => {
    try {
        const response = await axios.patch(
            API.ADMIN.ORDER.UPDATE_STATUS(id),
            { orderStatus }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to update order status"
        );
    }
}
