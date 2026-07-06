"use client";

import type { SyntheticEvent } from "react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { handleCheckout } from "@/lib/actions/orders-action";
import { handleAddAddress } from "@/lib/actions/users-action";
import type {
    AppliedDiscount,
    CheckoutAddress,
    CheckoutAddressForm,
    CheckoutCart,
    CheckoutUser,
} from "./checkout-types";
import { CheckoutSummary } from "./checkout-summary";
import { getSubtotal } from "./checkout-utils";

interface CheckoutFormProps {
    user: CheckoutUser;
    cart: CheckoutCart;
}

const splitName = (name?: string) => {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" "),
    };
};

const emptyAddressForm = (user: CheckoutUser): CheckoutAddressForm => {
    const name = splitName(user.name);
    return {
        firstName: name.firstName,
        lastName: name.lastName,
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        phone: "",
    };
};

const getAddressLabel = (address: CheckoutAddress) =>
    [address.label, address.line1, address.city].filter(Boolean).join(" · ");

export function CheckoutForm({ user, cart }: CheckoutFormProps) {
    const items = useMemo(() => cart.items || [], [cart.items]);
    const addresses = user.addresses || [];
    const [step, setStep] = useState<"delivery" | "payment">("delivery");
    const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?._id || "new");
    const [checkoutAddressId, setCheckoutAddressId] = useState<string | null>(addresses[0]?._id || null);
    const [addressForm, setAddressForm] = useState<CheckoutAddressForm>(() => emptyAddressForm(user));
    const [discount, setDiscount] = useState<AppliedDiscount | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const subtotal = useMemo(() => getSubtotal(items), [items]);
    const usingNewAddress = selectedAddressId === "new" || addresses.length === 0;

    const updateAddressField = (field: keyof CheckoutAddressForm, value: string) => {
        setCheckoutAddressId(null);
        setAddressForm((current) => ({ ...current, [field]: value }));
    };

    const createAddress = async () => {
        const result = await handleAddAddress({
            label: `${addressForm.firstName} ${addressForm.lastName}`.trim() || "Home",
            line1: addressForm.line1,
            line2: addressForm.line2 || undefined,
            city: addressForm.city,
            state: addressForm.state || undefined,
            postalCode: addressForm.postalCode,
            country: "Nepal",
            phone: addressForm.phone,
        });

        if (!result.success) {
            throw new Error(result.message || "Failed to save address");
        }

        const nextAddresses = result.data?.addresses || [];
        const created = nextAddresses[nextAddresses.length - 1];
        if (!created?._id) {
            throw new Error("Address was saved but no address ID was returned");
        }

        return created._id as string;
    };

    const continueToPayment = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        event.preventDefault();

        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setSubmitting(true);
        try {
            const addressId = usingNewAddress
                ? checkoutAddressId || await createAddress()
                : selectedAddressId;

            setCheckoutAddressId(addressId);
            setStep("payment");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to continue to payment");
        } finally {
            setSubmitting(false);
        }
    };

    const placeOrder = async () => {
        const addressId = checkoutAddressId || (!usingNewAddress ? selectedAddressId : null);
        if (!addressId || addressId === "new") {
            toast.error("Please complete your shipping address first");
            setStep("delivery");
            return;
        }

        setSubmitting(true);
        try {
            const result = await handleCheckout({
                addressId,
                ...(discount?.code ? { discountCode: discount.code } : {}),
            });

            if (!result.success || !result.payment) {
                toast.error(result.message || "Checkout failed");
                setSubmitting(false);
                return;
            }
            redirectToEsewa(result.payment);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Checkout failed");
            setSubmitting(false);
        }
    };

    const redirectToEsewa = (payment: { url: string; fields: Record<string, string> }) => {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payment.url;
        Object.entries(payment.fields).forEach(([name, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <main className="mx-auto w-full max-w-328 px-6 py-10 lg:px-10 lg:py-14">
            <div className="mb-10 flex justify-center">
                <div className="grid w-full max-w-xs grid-cols-2 items-center text-center text-sm">
                    <div>
                        <p className={step === "delivery" ? "font-semibold" : "text-muted"}>Delivery</p>
                        <div className="mx-auto mt-2 h-2 w-2 rounded-full bg-ink" />
                    </div>
                    <div className="relative before:absolute before:left-[-50%] before:top-[2.15rem] before:h-px before:w-full before:bg-border">
                        <p className={step === "payment" ? "font-semibold" : "text-muted"}>Payment</p>
                        <div className={`mx-auto mt-2 h-2 w-2 rounded-full ${step === "payment" ? "bg-ink" : "bg-border"}`} />
                    </div>
                </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-16">
                {step === "delivery" ? (
                    <form onSubmit={continueToPayment} className="space-y-8">
                        <section>
                            <h1 className="h4 mb-5">Contact Details</h1>
                            <label className="label-caps mb-2 block text-ink">Email</label>
                            <input
                                value={user.email || ""}
                                readOnly
                                className="w-full border border-border bg-neutral-50 px-4 py-3 text-sm text-neutral-600 outline-none"
                            />
                        </section>

                        <section className="border-t border-border pt-8">
                            <h2 className="h4 mb-5">Shipping Address</h2>

                            {addresses.length > 0 ? (
                                <div className="mb-6 space-y-3">
                                    {addresses.map((address) => (
                                        <label
                                            key={address._id}
                                            className="flex cursor-pointer items-start gap-3 border border-border p-4 transition hover:border-ink"
                                        >
                                            <input
                                                type="radio"
                                                name="addressMode"
                                                checked={selectedAddressId === address._id}
                                                onChange={() => {
                                                    setSelectedAddressId(address._id || "new");
                                                    setCheckoutAddressId(address._id || null);
                                                }}
                                                className="mt-1"
                                            />
                                            <span>
                                                <span className="block font-semibold">{address.label || "Saved address"}</span>
                                                <span className="body-sm block text-muted">{getAddressLabel(address)}</span>
                                            </span>
                                        </label>
                                    ))}
                                    <label className="flex cursor-pointer items-center gap-3 border border-border p-4 transition hover:border-ink">
                                        <input
                                            type="radio"
                                            name="addressMode"
                                            checked={usingNewAddress}
                                            onChange={() => {
                                                setSelectedAddressId("new");
                                                setCheckoutAddressId(null);
                                            }}
                                        />
                                        <span className="font-semibold">Ship to a new address</span>
                                    </label>
                                </div>
                            ) : (
                                <p className="body-sm mb-5 text-muted">Add your Nepal shipping address below.</p>
                            )}

                            {usingNewAddress ? (
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <CheckoutInput
                                        label="First Name"
                                        value={addressForm.firstName}
                                        onChange={(value) => updateAddressField("firstName", value)}
                                        required
                                    />
                                    <CheckoutInput
                                        label="Last Name"
                                        value={addressForm.lastName}
                                        onChange={(value) => updateAddressField("lastName", value)}
                                        required
                                    />
                                    <CheckoutInput
                                        label="Address Line"
                                        value={addressForm.line1}
                                        onChange={(value) => updateAddressField("line1", value)}
                                        required
                                        className="sm:col-span-2"
                                    />
                                    <CheckoutInput
                                        label="Apartment, Building, Landmark (Optional)"
                                        value={addressForm.line2}
                                        onChange={(value) => updateAddressField("line2", value)}
                                        className="sm:col-span-2"
                                    />
                                    <CheckoutInput
                                        label="Town / City"
                                        value={addressForm.city}
                                        onChange={(value) => updateAddressField("city", value)}
                                        required
                                    />
                                    <CheckoutInput
                                        label="Province / State"
                                        value={addressForm.state}
                                        onChange={(value) => updateAddressField("state", value)}
                                    />
                                    <CheckoutInput
                                        label="Phone"
                                        value={addressForm.phone}
                                        onChange={(value) => updateAddressField("phone", value)}
                                        required
                                    />
                                    <CheckoutInput
                                        label="Postal Code"
                                        value={addressForm.postalCode}
                                        onChange={(value) => updateAddressField("postalCode", value)}
                                        required
                                    />
                                </div>
                            ) : null}
                        </section>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="label-caps w-full bg-ink px-8 py-4 text-paper transition hover:bg-neutral-800 disabled:opacity-50 sm:w-80"
                        >
                            {submitting ? "Saving..." : "Continue To Payment"}
                        </button>
                    </form>
                ) : (
                    <section className="space-y-8">
                        <div>
                            <h1 className="h4 mb-5">Payment</h1>
                            <div className="border border-border p-5">
                                <p className="font-semibold">eSewa</p>
                                <p className="body-sm mt-2 text-muted">
                                    You'll be redirected to eSewa to complete payment securely. Your order is reserved until payment is confirmed.
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-border pt-8">
                            <h2 className="h4 mb-4">Delivery Details</h2>
                            <p className="body-sm text-muted">
                                Shipping address is saved for Nepal delivery.
                            </p>
                            <button
                                type="button"
                                onClick={() => setStep("delivery")}
                                className="body-sm mt-3 text-muted underline-offset-2 hover:text-ink hover:underline"
                            >
                                Edit delivery details
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={placeOrder}
                            disabled={submitting}
                            className="label-caps w-full bg-ink px-8 py-4 text-paper transition hover:bg-neutral-800 disabled:opacity-50 sm:w-80"
                        >
                            {submitting ? "Redirecting to eSewa..." : "Pay With eSewa"}
                        </button>
                    </section>
                )}

                <CheckoutSummary
                    items={items}
                    subtotal={subtotal}
                    discount={discount}
                    onDiscountChange={setDiscount}
                />
            </div>
        </main>
    );
}

function CheckoutInput({
    label,
    value,
    onChange,
    required = false,
    className = "",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="label-caps mb-2 block text-ink">
                {label}
                {required ? <span className="text-danger">*</span> : null}
            </label>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
                className="w-full border border-border bg-paper px-4 py-3 text-sm outline-none transition focus:border-ink"
            />
        </div>
    );
}
