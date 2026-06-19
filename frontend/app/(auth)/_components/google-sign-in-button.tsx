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

const NONCE_REFRESH_MS = 4 * 60 * 1000;

let initPromise: Promise<boolean> | null = null;
let activeCallback: ((response: { credential: string }) => void) | null = null;
let lastInitAt = 0;

const runInit = async (): Promise<boolean> => {
    const [nonce] = await Promise.all([prepareGoogleSignIn(), loadGsi()]);
    if (!window.google?.accounts?.id) return false;
    window.google.accounts.id.initialize({
        client_id: CLIENT_ID!,
        nonce,
        callback: (response) => activeCallback?.(response),
    });
    lastInitAt = Date.now();
    return true;
};

const ensureInitialized = (): Promise<boolean> => {
    if (initPromise) return initPromise;
    initPromise = runInit().finally(() => {
        initPromise = null;
    });
    return initPromise;
};

const refreshNonce = (): void => {
    if (Date.now() - lastInitAt < NONCE_REFRESH_MS) return;
    runInit();
};

export function GoogleSignInButton() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!CLIENT_ID) return;

        let cancelled = false;

        activeCallback = async (response) => {
            const res = await handleGoogleLogin(response.credential);
            if (res.success) {
                toast.success("Google sign-in succesful!");
                router.push(res.data?.role === "admin" ? "/admin" : "/");
                router.refresh();
            } else {
                toast.error(res.message || "Google sign-in failed");
            }
        };

        ensureInitialized().then((ready) => {
            if (cancelled || !ready || !window.google?.accounts?.id || !containerRef.current) return;

            const width = Math.min(containerRef.current.offsetWidth || 320, 400);
            window.google.accounts.id.renderButton(containerRef.current, {
                type: "standard",
                theme: "outline",
                size: "large",
                text: "continue_with",
                width,
            });
        });

        const interval = setInterval(() => {
            if (!cancelled) refreshNonce();
        }, NONCE_REFRESH_MS);

        const onVisible = () => {
            if (!cancelled && document.visibilityState === "visible") refreshNonce();
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            cancelled = true;
            clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisible);
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
