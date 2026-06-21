"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    handleGetAllOrders,
    handleUpdateOrderStatus,
} from "@/lib/actions/orders-action";
import type { OrderRecord } from "./order-types";
import { OrdersTable } from "./orders-table";

const fetchOrders = () => handleGetAllOrders();

export function OrdersManager() {
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        let isCurrent = true;

        const loadInitialData = async () => {
            const res = await fetchOrders();
            if (!isCurrent) return;

            if (res.success) setOrders(res.data || []);
            else toast.error(res.message || "Failed to load orders");

            setLoading(false);
        };

        loadInitialData();

        return () => {
            isCurrent = false;
        };
    }, []);

    const updateStatus = async (order: OrderRecord, status: string) => {
        setUpdatingId(order._id);
        const res = await handleUpdateOrderStatus(order._id, status);
        setUpdatingId(null);
        if (res.success) {
            toast.success("Order status updated");
            setOrders((prev) =>
                prev.map((o) => (o._id === order._id ? { ...o, orderStatus: status } : o))
            );
        } else {
            toast.error(res.message || "Update failed");
        }
    };

    return (
        <div className="px-6 py-10 sm:px-10">
            <p className="eyebrow mb-2">Operations</p>
            <h1 className="h1 mb-8">Orders</h1>

            {loading ? (
                <p className="body-sm text-muted">Loading…</p>
            ) : orders.length === 0 ? (
                <p className="body-sm text-muted">No orders yet.</p>
            ) : (
                <OrdersTable
                    orders={orders}
                    updatingId={updatingId}
                    onStatusChange={updateStatus}
                />
            )}
        </div>
    );
}
