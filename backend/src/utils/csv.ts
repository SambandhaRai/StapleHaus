const FORMULA_TRIGGERS = ["=", "+", "-", "@", "\t", "\r"];

const neutralizeFormula = (value: string): string => {
    if (value.length > 0 && FORMULA_TRIGGERS.includes(value[0])) {
        return `'${value}`;
    }
    return value;
};

export const toCsvCell = (value: unknown): string => {
    if (value === null || value === undefined) return '""';
    const raw = String(value);
    const safe = neutralizeFormula(raw).replace(/"/g, '""');
    return `"${safe}"`;
};

export const toCsv = (headers: string[], rows: unknown[][]): string => {
    const lines = [
        headers.map(toCsvCell).join(","),
        ...rows.map((row) => row.map(toCsvCell).join(",")),
    ];
    return `﻿${lines.join("\r\n")}\r\n`;
};
