export const formatPrice = (value: number | null | undefined) =>
    `NRs. ${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export const formatOrderStatus = (
    paymentStatus?: string,
    orderStatus?: string,
): string => {
    if (paymentStatus === "failed") return "Payment failed";
    if (!paymentStatus || paymentStatus === "pending") return "Awaiting payment";
    const status = orderStatus || "paid";
    return status.charAt(0).toUpperCase() + status.slice(1);
};
