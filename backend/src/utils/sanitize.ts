import sanitizeHtml from "sanitize-html";

const decodeOnce = (value: string): string =>
    value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");

const decodeFully = (value: string): string => {
    let previous = value;
    let current = decodeOnce(value);
    let guard = 0;
    while (current !== previous && guard < 10) {
        previous = current;
        current = decodeOnce(current);
        guard += 1;
    }
    return current;
};

export const stripHtml = (value: string): string =>
    decodeFully(
        sanitizeHtml(decodeFully(value), {
            allowedTags: [],
            allowedAttributes: {},
            disallowedTagsMode: "discard",
        })
    ).trim();
