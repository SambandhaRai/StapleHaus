import { OrderRepository } from "../repositories/order.repository";
import { CartRepository } from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";
import { UserRepository } from "../repositories/user.repository";
import { DiscountService } from "../services/discount.service";
import { ActivityLogService } from "../services/activity-log.service";
import { RequestContext } from "../types/activity-log.type";
import { IOrderItem } from "../models/order.model";
import { CheckoutDto } from "../dtos/order.dto";
import { OrderStatusType } from "../types/order.type";
import { HttpError } from "../errors/http-error";
import { ORDER_RESERVATION_MINUTES } from "../config";
import { buildEsewaForm, decodeEsewaCallback, isCallbackSignatureValid, verifyEsewaStatus } from "../utils/esewa";
import { VerifyPaymentDto } from "../dtos/order.dto";
import { logger } from "../utils/logger";
import mongoose from "mongoose";
import { randomUUID } from "crypto";

let orderRepository = new OrderRepository();
let cartRepository = new CartRepository();
let productRepository = new ProductRepository();
let userRepository = new UserRepository();
let discountService = new DiscountService();
let activityLogService = new ActivityLogService();

const round2 = (n: number) => Math.round(n * 100) / 100;

export class OrderService {

    async checkout(userId: string, data: CheckoutDto, context: RequestContext = {}) {
        if (!mongoose.Types.ObjectId.isValid(data.addressId)) {
            throw new HttpError(400, "Invalid address ID");
        }
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const address = user.addresses.find(a => a._id.toString() === data.addressId);
        if (!address) {
            throw new HttpError(404, "Shipping address not found");
        }

        const cart = await cartRepository.getByUserId(userId);
        if (!cart || cart.items.length === 0) {
            throw new HttpError(400, "Your cart is empty");
        }

        // Business-logic integrity: price and stock are re-read from MongoDB
        // here rather than trusted from the cart/client, so a tampered client
        // request can't change what the customer is actually charged.
        const orderItems: Omit<IOrderItem, "_id">[] = [];
        let subtotal = 0;

        for (const item of cart.items) {
            const product = await productRepository.getProductById(item.productId.toString());
            if (!product) {
                throw new HttpError(400, "A product in your cart no longer exists");
            }
            const variant = product.variants.find(v => v.sku === item.variantSku);
            if (!variant) {
                throw new HttpError(400, `A variant of "${product.name}" in your cart no longer exists`);
            }
            if (variant.stock < item.quantity) {
                throw new HttpError(400, `"${product.name}" (${variant.size}) only has ${variant.stock} left`);
            }

            const unitPrice = variant.priceOverride ?? product.basePrice;
            orderItems.push({
                productId: product._id,
                variantSku: item.variantSku,
                name: product.name,
                image: product.images?.[0],
                size: variant.size,
                color: variant.color,
                unitPrice,
                quantity: item.quantity,
            });
            subtotal += unitPrice * item.quantity;
        }
        subtotal = round2(subtotal);

        let discount: { code?: string; amount: number } = { amount: 0 };
        let appliedDiscountId: string | undefined;
        if (data.discountCode) {
            const applied = await discountService.validateDiscount({ code: data.discountCode, subtotal });
            discount = { code: applied.code, amount: applied.amount };
            appliedDiscountId = applied.discountId;
        }

        const total = round2(subtotal - discount.amount);

        if (appliedDiscountId && discount.code) {
            await discountService.reserveUsage(appliedDiscountId, discount.code, userId);
        }

        try {
            for (const item of cart.items) {
                const updated = await productRepository.decreaseStock(
                    item.productId.toString(),
                    item.variantSku,
                    item.quantity
                );
                if (!updated) {
                    throw new HttpError(400, "Stock changed during checkout, please review your cart and try again");
                }
            }
        } catch (error) {
            if (discount.code) {
                await discountService.releaseUsage(discount.code, userId);
            }
            throw error;
        }

        const shippingAddress = {
            label: address.label,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            phone: address.phone,
        };

        const isCod = data.paymentMethod === "cod";
        const transactionUuid = isCod ? undefined : randomUUID();

        const order = await orderRepository.createOrder({
            userId,
            items: orderItems,
            shippingAddress,
            subtotal,
            discount,
            total,
            transactionUuid,
            paymentMethod: isCod ? "cod" : "esewa",
            paymentStatus: "pending",
            orderStatus: "pending",
        });

        await activityLogService.record({
            ...context,
            action: "order_placed",
            status: "success",
            userId,
            email: user.email,
            reason: order._id.toString(),
        });

        if (isCod) {
            await cartRepository.clearItems(userId);
            return { order, payment: null };
        }

        const payment = buildEsewaForm(transactionUuid!, total);

        return { order, payment };
    }

    private async restoreStock(order: { items: { productId: mongoose.Types.ObjectId; variantSku: string; quantity: number }[] }) {
        for (const item of order.items) {
            await productRepository.increaseStock(
                item.productId.toString(),
                item.variantSku,
                item.quantity
            );
        }
    }

    private async restoreDiscount(order: { userId: mongoose.Types.ObjectId | string; discount?: { code?: string } }) {
        if (order.discount?.code) {
            await discountService.releaseUsage(order.discount.code, order.userId.toString());
        }
    }

    async verifyPayment(userId: string, data: VerifyPaymentDto, context: RequestContext = {}) {
        const callback = decodeEsewaCallback(data.data);
        if (!callback || !callback.transaction_uuid) {
            throw new HttpError(400, "Invalid payment response");
        }
        // Payment integrity: the eSewa callback is signature-verified (and its
        // status re-checked directly with eSewa below) instead of trusting
        // whatever "paid" flag the browser redirect claims, so a forged
        // callback can't mark an unpaid order as paid.
        if (!isCallbackSignatureValid(callback)) {
            logger.warn("eSewa callback signature mismatch", { transactionUuid: callback.transaction_uuid });
            throw new HttpError(400, "Invalid payment signature");
        }

        const order = await orderRepository.getByTransactionUuid(callback.transaction_uuid);
        if (!order || order.userId.toString() !== userId) {
            throw new HttpError(404, "Order not found");
        }
        if (order.paymentStatus === "paid") {
            return order;
        }
        if (order.paymentStatus === "failed") {
            throw new HttpError(400, "This payment has already failed. Please place a new order.");
        }

        const isComplete = callback.status === "COMPLETE" && await verifyEsewaStatus(order.transactionUuid!, order.total);

        if (!isComplete) {
            await this.restoreStock(order);
            await this.restoreDiscount(order);
            await orderRepository.updatePaymentResult(order._id.toString(), {
                paymentStatus: "failed",
                orderStatus: "cancelled",
            });
            logger.warn("Order payment not completed, stock released", {
                orderId: order._id.toString(),
                transactionUuid: order.transactionUuid,
            });
            await activityLogService.record({
                ...context,
                action: "payment_failed",
                status: "failure",
                userId,
                email: (await userRepository.getUserById(userId))?.email,
                reason: order._id.toString(),
            });
            throw new HttpError(400, "Payment was not completed. Your items have been released.");
        }

        const paidOrder = await orderRepository.updatePaymentResult(order._id.toString(), {
            paymentStatus: "paid",
            orderStatus: "paid",
            paymentRef: callback.transaction_code,
        });
        logger.info("Order payment verified", {
            orderId: order._id.toString(),
            paymentRef: callback.transaction_code,
        });
        await activityLogService.record({
            ...context,
            action: "payment_verified",
            status: "success",
            userId,
            email: (await userRepository.getUserById(userId))?.email,
            reason: order._id.toString(),
        });

        await cartRepository.clearItems(userId);

        return paidOrder;
    }

    async releaseExpiredOrders(): Promise<number> {
        const cutoff = new Date(Date.now() - ORDER_RESERVATION_MINUTES * 60 * 1000);
        const expired = await orderRepository.getExpiredPendingOrders(cutoff);
        let released = 0;

        for (const order of expired) {
            const claimed = await orderRepository.markExpiredIfPending(order._id.toString());
            if (!claimed) {
                continue;
            }

            await this.restoreStock(order);
            await this.restoreDiscount(order);
            released += 1;

            logger.info("Released expired order reservation", {
                orderId: order._id.toString(),
                createdAt: order.createdAt,
            });

            await activityLogService.record({
                action: "order_expired",
                status: "failure",
                userId: order.userId.toString(),
                email: (await userRepository.getUserById(order.userId.toString()))?.email,
                reason: order._id.toString(),
            });
        }

        return released;
    }

    async getMyOrders(userId: string) {
        return await orderRepository.getOrdersByUserId(userId);
    }

    async getOrderById(userId: string, orderId: string) {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new HttpError(400, "Invalid order ID");
        }
        // IDOR prevention: userId comes from the verified session (authorization
        // middleware), not from anything the client supplies, so guessing or
        // incrementing another order's ID in the URL still fails this ownership
        // check. Both "doesn't exist" and "exists but isn't yours" should read
        // as a generic not-found to the caller so order IDs can't be enumerated.
        const order = await orderRepository.getOrderById(orderId);
        if (!order) {
            throw new HttpError(404, "Order not found");
        }
        if (order.userId.toString() !== userId) {
            throw new HttpError(403, "You do not have access to this order");
        }
        return order;
    }

    async getAllOrders() {
        return await orderRepository.getAllOrders();
    }

    async updateOrderStatus(orderId: string, orderStatus: OrderStatusType) {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new HttpError(400, "Invalid order ID");
        }
        const updated = await orderRepository.updateOrderStatus(orderId, orderStatus);
        if (!updated) {
            throw new HttpError(404, "Order not found");
        }
        return updated;
    }
}
