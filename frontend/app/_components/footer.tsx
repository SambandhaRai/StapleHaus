import Link from "next/link";

interface FooterColumn {
    heading: string;
    links: { label: string; href: string }[];
}

const socials = [
    {
        label: "Instagram",
        path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.86.07s-3.6 0-4.86-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.46 2.21 8.84 2.2 12 2.2Zm0 3.05A6.75 6.75 0 1 0 18.75 12 6.75 6.75 0 0 0 12 5.25Zm0 11.13A4.38 4.38 0 1 1 16.38 12 4.38 4.38 0 0 1 12 16.38Zm6.96-11.45a1.58 1.58 0 1 1-1.57-1.58 1.58 1.58 0 0 1 1.57 1.58Z",
    },
    {
        label: "Facebook",
        path: "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z",
    },
    {
        label: "X",
        path: "M18.9 2H22l-7.05 8.06L23.5 22h-6.6l-5.17-6.76L5.8 22H2.7l7.54-8.62L1.9 2h6.77l4.67 6.18Zm-1.16 18h1.71L7.34 3.74H5.5Z",
    },
];

const shopLinks = [
    { label: "New Arrivals", href: "#" },
    { label: "Brands", href: "#" },
    { label: "Clothing", href: "#" },
    { label: "Footwear", href: "#" },
    { label: "Accessories", href: "#" },
    { label: "Sale", href: "#" },
];

const columns: FooterColumn[] = [
    { heading: "Men", links: shopLinks },
    { heading: "Women", links: shopLinks },
    {
        heading: "Archives",
        links: [
            { label: "New Arrivals", href: "#" },
            { label: "Brands", href: "#" },
            { label: "Clothing", href: "#" },
            { label: "Footwear", href: "#" },
        ],
    },
    {
        heading: "Help",
        links: [
            { label: "FAQ", href: "#" },
            { label: "Delivery & Shipping", href: "#" },
            { label: "Returns", href: "#" },
            { label: "Duties & Taxes", href: "#" },
            { label: "Contact Us", href: "#" },
        ],
    },
    {
        heading: "About",
        links: [
            { label: "About Us", href: "#" },
            { label: "Journal", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Retail Store", href: "#" },
        ],
    },
];

export function Footer() {
    return (
        <footer className="border-t border-border bg-neutral-50">
            <div className="mx-auto w-full max-w-7xl px-6 py-14">
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
                    {columns.map((column) => (
                        <nav key={column.heading} className="flex flex-col">
                            <p className="eyebrow mb-4">{column.heading}</p>
                            {column.links.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="body-sm py-1.5 text-muted transition hover:text-ink"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    ))}

                    <div>
                        <p className="eyebrow mb-4">Follow Us</p>
                        <div className="flex gap-4">
                            {socials.map((social) => (
                                <Link
                                    key={social.label}
                                    href="#"
                                    aria-label={social.label}
                                    className="text-ink transition hover:opacity-60"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d={social.path} />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-border">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <span
                        className="text-lg font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        STAPLEHAUS
                    </span>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <Link href="#" className="body-sm text-muted transition hover:text-ink">
                            Terms &amp; Conditions
                        </Link>
                        <Link href="#" className="body-sm text-muted transition hover:text-ink">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="body-sm text-muted transition hover:text-ink">
                            Cookie Policy
                        </Link>
                    </div>
                    <span className="body-sm text-muted">© 2026 StapleHaus</span>
                </div>
            </div>
        </footer>
    );
}
