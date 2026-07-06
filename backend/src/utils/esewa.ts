import { createHmac } from "crypto";
import { ESEWA_PRODUCT_CODE, ESEWA_SECRET, ESEWA_FORM_URL, ESEWA_STATUS_URL, FRONTEND_URL } from "../config";

const SIGNED_FIELDS = "total_amount,transaction_uuid,product_code";

export type EsewaFormFields = {
    amount: string;
    tax_amount: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    product_service_charge: string;
    product_delivery_charge: string;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature: string;
};

export type EsewaCallback = {
    transaction_code?: string;
    status?: string;
    total_amount?: string;
    transaction_uuid?: string;
    product_code?: string;
    signed_field_names?: string;
    signature?: string;
};

const sign = (message: string): string =>
    createHmac("sha256", ESEWA_SECRET).update(message).digest("base64");

const normalizeAmount = (value: string | number): string =>
    String(value).replace(/,/g, "").trim();

export const buildEsewaForm = (transactionUuid: string, totalAmount: number): { url: string; fields: EsewaFormFields } => {
    const total = normalizeAmount(totalAmount);
    const signature = sign(`total_amount=${total},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`);

    return {
        url: ESEWA_FORM_URL,
        fields: {
            amount: total,
            tax_amount: "0",
            total_amount: total,
            transaction_uuid: transactionUuid,
            product_code: ESEWA_PRODUCT_CODE,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${FRONTEND_URL}/checkout/success`,
            failure_url: `${FRONTEND_URL}/checkout/failure`,
            signed_field_names: SIGNED_FIELDS,
            signature,
        },
    };
};

export const decodeEsewaCallback = (data: string): EsewaCallback | null => {
    try {
        const json = Buffer.from(data, "base64").toString("utf8");
        return JSON.parse(json) as EsewaCallback;
    } catch {
        return null;
    }
};

export const isCallbackSignatureValid = (payload: EsewaCallback): boolean => {
    if (!payload.signature || !payload.signed_field_names) {
        return false;
    }
    const message = payload.signed_field_names
        .split(",")
        .map((field) => `${field}=${(payload as Record<string, string>)[field] ?? ""}`)
        .join(",");
    return sign(message) === payload.signature;
};

export const verifyEsewaStatus = async (transactionUuid: string, totalAmount: number): Promise<boolean> => {
    const total = normalizeAmount(totalAmount);
    const url = `${ESEWA_STATUS_URL}?product_code=${ESEWA_PRODUCT_CODE}&total_amount=${total}&transaction_uuid=${transactionUuid}`;

    const response = await fetch(url);
    if (!response.ok) {
        return false;
    }
    const data = await response.json() as { status?: string; total_amount?: string | number };
    if (data.status !== "COMPLETE") {
        return false;
    }
    return Number(data.total_amount) === Number(totalAmount);
};
