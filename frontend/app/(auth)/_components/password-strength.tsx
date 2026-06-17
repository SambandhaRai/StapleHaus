import { Check, X } from "lucide-react";

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

const getStrengthLabel = (passed: number) => {
    if (passed <= 2) return "Weak";
    if (passed <= 4) return "Almost there";
    return "Strong";
};

const getStrengthColor = (passed: number) => {
    if (passed <= 2) return "bg-danger";
    if (passed <= 4) return "bg-amber-500";
    return "bg-success";
};

const getStrengthTextColor = (passed: number) => {
    if (passed <= 2) return "text-danger";
    if (passed <= 4) return "text-amber-700";
    return "text-success";
};

export function PasswordStrength({ password }: { password: string }) {
    const checks = PASSWORD_REQUIREMENTS.map((requirement) => ({
        ...requirement,
        passed: requirement.test(password),
    }));
    const passed = checks.filter((check) => check.passed).length;
    const strengthColor = getStrengthColor(passed);

    return (
        <div className="mt-3 border border-border bg-neutral-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
                <p className="label-caps text-neutral-700">Password strength</p>
                <p className={`text-xs font-medium ${getStrengthTextColor(passed)}`}>
                    {getStrengthLabel(passed)}
                </p>
            </div>
            <div className="mb-3 grid grid-cols-5 gap-1">
                {checks.map((check, index) => (
                    <span
                        key={check.id}
                        className={`h-1 ${index < passed ? strengthColor : "bg-neutral-200"}`}
                    />
                ))}
            </div>
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
