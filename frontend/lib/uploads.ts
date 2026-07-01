const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5050";

export const getUploadUrl = (fileName?: string | null) => {
    if (!fileName) return "";
    if (/^(https?:|blob:|data:)/.test(fileName)) return fileName;

    const normalized = fileName.startsWith("/uploads/")
        ? fileName.slice("/uploads/".length)
        : fileName;

    return `${API_BASE_URL}/uploads/${encodeURIComponent(normalized)}`;
};
