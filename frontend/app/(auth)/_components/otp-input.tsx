"use client";

import { useRef } from "react";

interface OtpInputProps {
    value: string;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
    length?: number;
    disabled?: boolean;
}

export function OtpInput({ value, onChange, onComplete, length = 6, disabled }: OtpInputProps) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const setDigit = (index: number, digit: string) => {
        const next = value.split("");
        next[index] = digit;
        const joined = next.join("").slice(0, length);
        onChange(joined);
        return joined;
    };

    const handleChange = (index: number, raw: string) => {
        const digit = raw.replace(/\D/g, "").slice(-1);
        if (!digit) return;
        const joined = setDigit(index, digit);
        if (index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
        if (joined.length === length && !joined.includes("") && onComplete) {
            onComplete(joined);
        }
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace") {
            event.preventDefault();
            if (value[index]) {
                setDigit(index, "");
            } else if (index > 0) {
                setDigit(index - 1, "");
                inputsRef.current[index - 1]?.focus();
            }
        } else if (event.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (event.key === "ArrowRight" && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (!digits) return;
        onChange(digits);
        const focusIndex = Math.min(digits.length, length - 1);
        inputsRef.current[focusIndex]?.focus();
        if (digits.length === length && onComplete) onComplete(digits);
    };

    return (
        <div className="flex justify-between gap-2">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    disabled={disabled}
                    value={value[index] ?? ""}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    onFocus={(event) => event.target.select()}
                    className="numeric h-12 w-full border border-border bg-paper text-center text-lg text-ink outline-none transition focus:border-ink disabled:opacity-50 sm:h-14"
                />
            ))}
        </div>
    );
}
