"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

interface RecaptchaApi {
    render: (
        el: HTMLElement,
        options: {
            sitekey: string;
            callback: (token: string) => void;
            "expired-callback"?: () => void;
            "error-callback"?: () => void;
            theme?: string;
        },
    ) => number;
    reset: (id: number) => void;
}

declare global {
    interface Window {
        grecaptcha?: RecaptchaApi;
        __onRecaptchaLoad?: () => void;
    }
}

let scriptPromise: Promise<void> | null = null;

const loadRecaptcha = (): Promise<void> => {
    if (window.grecaptcha?.render) return Promise.resolve();
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve) => {
        window.__onRecaptchaLoad = () => resolve();
        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js?render=explicit&onload=__onRecaptchaLoad";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    });
    return scriptPromise;
};

interface RecaptchaWidgetProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
}

export function RecaptchaWidget({ onVerify, onExpire }: RecaptchaWidgetProps) {
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
        let widgetId: number | null = null;
        let cancelled = false;

        loadRecaptcha().then(() => {
            if (cancelled || !window.grecaptcha || !containerRef.current) return;
            widgetId = window.grecaptcha.render(containerRef.current, {
                sitekey: SITE_KEY,
                callback: (token) => onVerifyRef.current(token),
                "expired-callback": () => onExpireRef.current?.(),
                "error-callback": () => onExpireRef.current?.(),
                theme: "light",
            });
        });

        return () => {
            cancelled = true;
            if (widgetId !== null && window.grecaptcha) window.grecaptcha.reset(widgetId);
        };
    }, []);

    if (!SITE_KEY) return null;

    return <div ref={containerRef} />;
}
