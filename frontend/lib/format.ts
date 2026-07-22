export const formatPrice = (value: number | null | undefined) =>
    `NRs. ${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export const formatWhen = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
};

export const formatOrderStatus = (
    paymentStatus?: string,
    orderStatus?: string,
    paymentMethod?: string,
): string => {
    if (paymentStatus === "failed") return "Payment failed";
    if (!paymentStatus || paymentStatus === "pending") {
        if (paymentMethod === "cod") {
            const status = orderStatus && orderStatus !== "pending" ? orderStatus : "confirmed";
            return `${status.charAt(0).toUpperCase() + status.slice(1)} · Cash on delivery`;
        }
        return "Awaiting payment";
    }
    const status = orderStatus || "paid";
    return status.charAt(0).toUpperCase() + status.slice(1);
};
