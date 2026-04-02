"use client";

import React, { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@/messages/en.json";

type Props = { children: React.ReactNode };
type IntlMessages = Record<string, unknown>;
const SUPPORTED_LOCALES = new Set(["en", "te"]);

export default function IntlProviderClient({ children }: Props) {
  const [locale, setLocale] = useState<string>("en");
  const [messages, setMessages] = useState<IntlMessages>(enMessages as IntlMessages);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
    const initial = stored && SUPPORTED_LOCALES.has(stored) ? stored : "en";
    if (!stored || !SUPPORTED_LOCALES.has(stored)) {
      localStorage.setItem("locale", "en");
    }
    setLocale(initial);
  }, []);

  useEffect(() => {
    let cancelled = false;
    import(`../messages/${locale}.json`)
      .then((m) => {
        if (!cancelled) setMessages(m.default ?? m);
      })
      .catch(() => {
        // fallback to english if messages missing
        import(`../messages/en.json`).then((m) => {
          if (!cancelled) setMessages(m.default ?? m);
        });
      });

    const onStorage = (e: StorageEvent) => {
      if (e.key === "locale") {
        const next = e.newValue && SUPPORTED_LOCALES.has(e.newValue) ? e.newValue : "en";
        setLocale(next);
      }
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as string | undefined;
      if (detail) {
        setLocale(SUPPORTED_LOCALES.has(detail) ? detail : "en");
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("nm-locale-changed", onCustom as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("nm-locale-changed", onCustom as EventListener);
    };
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Kolkata">
      {children}
    </NextIntlClientProvider>
  );
}
