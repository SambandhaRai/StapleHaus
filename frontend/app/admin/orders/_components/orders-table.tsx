import { formatPrice } from "@/lib/format";
import type { OrderRecord } from "./order-types";
import { ORDER_STATUSES } from "./order-types";

interface OrdersTableProps {
    orders: OrderRecord[];
    updatingId: string | null;
    onStatusChange: (order: OrderRecord, status: string) => void;
}

export function OrdersTable({ orders, updatingId, onStatusChange }: OrdersTableProps) {
    return (
        <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
                <thead className="border-b border-border bg-neutral-50">
                    <tr>
                        <th className="label-caps px-4 py-3 text-left text-muted">Order</th>
                        <th className="label-caps px-4 py-3 text-right text-muted">Items</th>
                        <th className="label-caps px-4 py-3 text-right text-muted">Total</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Payment</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Status</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id} className="border-b border-border/60 last:border-0">
                            <td className="numeric px-4 py-3 font-medium">
                                #{String(order._id).slice(-6).toUpperCase()}
                            </td>
                            <td className="numeric px-4 py-3 text-right text-muted">
                                {Array.isArray(order.items) ? order.items.length : 0}
                            </td>
                            <td className="numeric px-4 py-3 text-right">
                                {formatPrice(order.total)}
                            </td>
                            <td className="px-4 py-3 text-muted">{order.paymentStatus}</td>
                            <td className="px-4 py-3">
                                <select
                                    value={order.orderStatus}
                                    disabled={updatingId === order._id}
                                    onChange={(event) => onStatusChange(order, event.target.value)}
                                    className="border border-border bg-paper px-2 py-1.5 text-sm outline-none transition focus:border-ink disabled:opacity-50"
                                >
                                    {ORDER_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-4 py-3 text-muted">
                                {order.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString()
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
