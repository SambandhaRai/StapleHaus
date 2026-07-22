import sanitizeHtml from "sanitize-html";

const decodeEntities = (value: string): string =>
    value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");

export const stripHtml = (value: string): string =>
    decodeEntities(
        sanitizeHtml(value, { allowedTags: [], allowedAttributes: {}, disallowedTagsMode: "discard" })
    ).trim();
