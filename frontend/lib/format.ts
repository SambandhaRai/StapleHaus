export const formatPrice = (value: number | null | undefined) =>
    `NRs. ${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
