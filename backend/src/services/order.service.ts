import { OrderRepository } from "../repositories/order.repository";
import { CartRepository } from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";
import { UserRepository } from "../repositories/user.repository";
import { DiscountService } from "../services/discount.service";
import { IOrderItem } from "../models/order.model";
import { CheckoutDto } from "../dtos/order.dto";
import { OrderStatusType } from "../types/order.type";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

let orderRepository = new OrderRepository();
let cartRepository = new CartRepository();
let productRepository = new ProductRepository();
let userRepository = new UserRepository();
let discountService = new DiscountService();

const round2 = (n: number) => Math.round(n * 100) / 100;

export class OrderService {

    async checkout(userId: string, data: CheckoutDto) {
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
        let appliedDiscountId: string | null = null;
        if (data.discountCode) {
            const applied = await discountService.validateDiscount({ code: data.discountCode, subtotal });
            discount = { code: applied.code, amount: applied.amount };
            appliedDiscountId = applied.discountId;
        }

        const total = round2(subtotal - discount.amount);

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

        const order = await orderRepository.createOrder({
            userId,
            items: orderItems,
            shippingAddress,
            subtotal,
            discount,
            total,
            paymentStatus: "paid",
            orderStatus: "paid",
        });

        if (appliedDiscountId) {
            await discountService.redeemDiscount(appliedDiscountId);
        }
        await cartRepository.clearItems(userId);

        return order;
    }

    async getMyOrders(userId: string) {
        return await orderRepository.getOrdersByUserId(userId);
    }

    async getOrderById(userId: string, orderId: string) {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new HttpError(400, "Invalid order ID");
        }
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
