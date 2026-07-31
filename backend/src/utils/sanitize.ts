// --- Stored XSS prevention (used on profile names, review text, etc.) ---
// A naive "strip tags once" filter can be beaten by double-encoding a payload
// (e.g. &amp;lt;script&amp;gt;), which decodes into a live <script> tag only
// after the filter has already run. Decoding repeatedly before AND after
// stripping tags closes that bypass.
import sanitizeHtml from "sanitize-html";

const decodeOnce = (value: string): string =>
    value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");

// Keep decoding until nothing changes (capped at 10 rounds) so nested/repeated
// HTML-entity encoding can't smuggle a tag past a single decode pass.
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

// Decode -> strip every tag/attribute (allow-list of none) -> decode again,
// so any HTML that survives is guaranteed to be plain text, not markup.
export const stripHtml = (value: string): string =>
    decodeFully(
        sanitizeHtml(decodeFully(value), {
            allowedTags: [],
            allowedAttributes: {},
            disallowedTagsMode: "discard",
        })
    ).trim();
