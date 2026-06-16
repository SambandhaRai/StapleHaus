import Link from "next/link";

interface AuthSidePanelProps {
    eyebrow: string;
    title: string;
    description: string;
}

export function AuthSidePanel({ eyebrow, title, description }: AuthSidePanelProps) {
    return (
        <aside className="relative hidden flex-col justify-between bg-ink p-12 text-paper lg:flex lg:w-1/2">
            <Link
                href="/"
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
            >
                STAPLEHAUS
            </Link>
            <div className="max-w-md">
                <p className="eyebrow mb-4 text-paper/50">{eyebrow}</p>
                <h2
                    className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {title}
                </h2>
                <p className="mt-5 max-w-sm text-paper/60">{description}</p>
            </div>
            <p className="text-xs text-paper/40">© 2026 StapleHaus</p>
        </aside>
    );
}
