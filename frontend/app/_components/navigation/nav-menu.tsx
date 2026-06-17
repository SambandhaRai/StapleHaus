import Link from "next/link";

interface NavMenuItem {
    label: string;
    href: string;
}

interface NavMenuProps {
    label: string;
    href: string;
    heading?: string;
    items: NavMenuItem[];
    triggerClassName?: string;
}

export function NavMenu({ label, href, heading, items, triggerClassName }: NavMenuProps) {
    return (
        <div className="group relative flex items-center">
            <Link className={`label-caps link-underline inline-flex items-center leading-none ${triggerClassName ?? ""}`} href={href}>
                {label}
            </Link>

            {items.length > 0 ? (
                <div className="invisible absolute left-0 top-full z-50 pt-4.5 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="w-56 border border-border bg-paper p-5 shadow-lg">
                        {heading ? <p className="eyebrow mb-3 text-muted">{heading}</p> : null}
                        <nav className="flex flex-col">
                            {items.map((item) => (
                                <Link
                                    key={`${item.href}-${item.label}`}
                                    href={item.href}
                                    className="py-2 text-sm transition hover:text-muted"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
