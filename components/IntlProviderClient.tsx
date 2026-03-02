"use client";

import React, { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";

type Props = { children: React.ReactNode };

export default function IntlProviderClient({ children }: Props) {
  const [locale, setLocale] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
    const initial = stored ?? "en";
    setLocale(initial);
  }, []);

  useEffect(() => {
    if (!locale) return;
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
      if (e.key === "locale") setLocale(e.newValue ?? "en");
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as string | undefined;
      if (detail) setLocale(detail);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("nm-locale-changed", onCustom as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("nm-locale-changed", onCustom as EventListener);
    };
  }, [locale]);

  // while messages are loading we still render the provider with empty
  // messages to ensure hooks like `useTranslations` have a context to read
  // from. Previously we returned the children directly which caused a
  // "missing context" error when user components invoked the hook before
  // the provider was available.
  return (
    <NextIntlClientProvider locale={locale ?? "en"} messages={messages ?? {}}>
      {children}
    </NextIntlClientProvider>
  );
}
