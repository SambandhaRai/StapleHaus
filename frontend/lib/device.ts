export const describeDevice = (userAgent?: string) => {
    if (!userAgent) return "Unknown device";

    const browser = /Edg/.test(userAgent) ? "Edge"
        : /Chrome/.test(userAgent) ? "Chrome"
        : /Firefox/.test(userAgent) ? "Firefox"
        : /Safari/.test(userAgent) ? "Safari"
        : "Browser";

    const os = /Windows/.test(userAgent) ? "Windows"
        : /iPhone|iPad|iOS/.test(userAgent) ? "iOS"
        : /Mac OS X|Macintosh/.test(userAgent) ? "macOS"
        : /Android/.test(userAgent) ? "Android"
        : /Linux/.test(userAgent) ? "Linux"
        : "Unknown OS";

    return `${browser} on ${os}`;
};
