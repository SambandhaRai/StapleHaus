"use server";

import { assertCsrfToken } from "../csrf";
import {
    checkout,
    verifyPayment,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} from "../api/orders";

export const handleCheckout = async (orderData: any, csrfToken?: string) => {
    try {
        await assertCsrfToken(csrfToken);
        const result = await checkout(orderData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                payment: result.payment,
                message: "Order created, redirecting to payment"
            };
        }
        return {
            success: false,
            message: result.message || "Checkout Failed"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Checkout Failed"
        };
    }
}

export const handleVerifyPayment = async (data: string) => {
    try {
        const result = await verifyPayment(data);
        return {
            success: Boolean(result.success),
            data: result.data,
            message: result.message || "Payment verified"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Payment verification failed"
        };
    }
}

export const handleGetMyOrders = async () => {
    try {
        return await getMyOrders();
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to load orders"
        };
    }
}

export const handleGetOrderById = async (id: string) => {
    try {
        return await getOrderById(id);
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to load order"
        };
    }
}

export const handleGetAllOrders = async () => {
    try {
        return await getAllOrders();
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to load orders"
        };
    }
}

export const handleUpdateOrderStatus = async (id: string, orderStatus: string) => {
    try {
        const result = await updateOrderStatus(id, orderStatus);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Order status updated successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update order status"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to update order status"
        };
    }
}
