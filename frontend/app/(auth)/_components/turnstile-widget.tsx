"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface TurnstileApi {
    render: (
        el: HTMLElement,
        options: {
            sitekey: string;
            callback: (token: string) => void;
            "expired-callback"?: () => void;
            "error-callback"?: () => void;
            theme?: string;
        },
    ) => string;
    remove: (id: string) => void;
}

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

let scriptPromise: Promise<void> | null = null;

const loadTurnstile = (): Promise<void> => {
    if (window.turnstile) return Promise.resolve();
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
    });
    return scriptPromise;
};

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
}

export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
        onVerifyRef.current = onVerify;
    }, [onVerify]);

    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    useEffect(() => {
        if (!SITE_KEY) return;
        let widgetId: string | null = null;
        let cancelled = false;

        loadTurnstile().then(() => {
            if (cancelled || !window.turnstile || !containerRef.current) return;
            widgetId = window.turnstile.render(containerRef.current, {
                sitekey: SITE_KEY,
                callback: (token) => onVerifyRef.current(token),
                "expired-callback": () => onExpireRef.current?.(),
                "error-callback": () => onExpireRef.current?.(),
                theme: "light",
            });
        });

        return () => {
            cancelled = true;
            if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
        };
    }, []);

    if (!SITE_KEY) return null;

    return <div ref={containerRef} />;
}
