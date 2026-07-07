"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as zxcvbnCommon from "@zxcvbn-ts/language-common";
import * as zxcvbnEn from "@zxcvbn-ts/language-en";

const zxcvbnInstance = new ZxcvbnFactory({
    dictionary: {
        ...zxcvbnCommon.dictionary,
        ...zxcvbnEn.dictionary,
    },
    graphs: zxcvbnCommon.adjacencyGraphs,
    translations: zxcvbnEn.translations,
});

export const PASSWORD_REQUIREMENTS = [
    {
        id: "length",
        label: "At least 8 characters",
        test: (password: string) => password.length >= 8,
    },
    {
        id: "lowercase",
        label: "One lowercase letter",
        test: (password: string) => /[a-z]/.test(password),
    },
    {
        id: "uppercase",
        label: "One uppercase letter",
        test: (password: string) => /[A-Z]/.test(password),
    },
    {
        id: "number",
        label: "One number",
        test: (password: string) => /\d/.test(password),
    },
    {
        id: "symbol",
        label: "One symbol",
        test: (password: string) => /[^A-Za-z0-9]/.test(password),
    },
] as const;

export const passwordIsStrong = (password: string) =>
    PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(password));

const getStrengthLabel = (score: number) => {
    if (score <= 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    return "Strong";
};

const getStrengthColor = (score: number) => {
    if (score <= 1) return "bg-danger";
    if (score === 2) return "bg-amber-500";
    if (score === 3) return "bg-amber-400";
    return "bg-success";
};

const getStrengthTextColor = (score: number) => {
    if (score <= 1) return "text-danger";
    if (score <= 3) return "text-amber-700";
    return "text-success";
};

export function PasswordStrength({ password }: { password: string }) {
    const result = useMemo(() => zxcvbnInstance.check(password), [password]);
    const score = result.score;
    const warning = result.feedback.warning;

    const checks = PASSWORD_REQUIREMENTS.map((requirement) => ({
        ...requirement,
        passed: requirement.test(password),
    }));
    const strengthColor = getStrengthColor(score);

    return (
        <div className="mt-3 border border-border bg-neutral-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
                <p className="label-caps text-neutral-700">Password strength</p>
                <p className={`text-xs font-medium ${getStrengthTextColor(score)}`}>
                    {getStrengthLabel(score)}
                </p>
            </div>
            <div className="mb-3 grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((index) => (
                    <span
                        key={index}
                        className={`h-1 ${index < score ? strengthColor : "bg-neutral-200"}`}
                    />
                ))}
            </div>
            {warning ? (
                <p className="mb-3 text-xs text-danger">{warning}</p>
            ) : null}
            <ul className="grid gap-1.5">
                {checks.map((check) => (
                    <li
                        key={check.id}
                        className={`flex items-center gap-2 text-xs ${check.passed ? "text-success" : "text-muted"}`}
                    >
                        {check.passed ? <Check size={13} /> : <X size={13} />}
                        {check.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
