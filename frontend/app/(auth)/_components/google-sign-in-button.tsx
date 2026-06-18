"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { prepareGoogleSignIn, handleGoogleLogin } from "@/lib/actions/auth-action";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleIdentity {
    accounts: {
        id: {
            initialize: (config: { client_id: string; nonce?: string; callback: (response: { credential: string }) => void }) => void;
            renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
    };
}

declare global {
    interface Window {
        google?: GoogleIdentity;
    }
}

let scriptPromise: Promise<void> | null = null;

const loadGsi = (): Promise<void> => {
    if (window.google?.accounts?.id) return Promise.resolve();
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
    });
    return scriptPromise;
};

export function GoogleSignInButton() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!CLIENT_ID) return;

        let cancelled = false;

        const setup = async () => {
            const [nonce] = await Promise.all([prepareGoogleSignIn(), loadGsi()]);
            if (cancelled || !window.google?.accounts?.id || !containerRef.current) return;

            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                nonce,
                callback: async (response) => {
                    const res = await handleGoogleLogin(response.credential);
                    if (res.success) {
                        toast.success("Welcome!");
                        router.push(res.data?.role === "admin" ? "/admin" : "/");
                        router.refresh();
                    } else {
                        toast.error(res.message || "Google sign-in failed");
                    }
                },
            });

            window.google.accounts.id.renderButton(containerRef.current, {
                type: "standard",
                theme: "outline",
                size: "large",
                text: "continue_with",
                width: 320,
            });
        };

        setup();

        return () => {
            cancelled = true;
        };
    }, [router]);

    if (!CLIENT_ID) return null;

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="eyebrow text-subtle">or</span>
                <span className="h-px flex-1 bg-border" />
            </div>
            <div ref={containerRef} className="flex justify-center" />
        </div>
    );
}
