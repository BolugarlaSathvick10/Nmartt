"use client";

import React, { useEffect, useState } from "react";

const SUPPORTED_LOCALES = new Set(["en", "te"]);

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState<string>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
    const next = stored && SUPPORTED_LOCALES.has(stored) ? stored : "en";
    setLocale(next);
  }, []);

  const toggle = () => {
    const next = locale === "en" ? "te" : "en";
    localStorage.setItem("locale", next);
    setLocale(next);
    window.dispatchEvent(new CustomEvent("nm-locale-changed", { detail: next }));
  };

  return (
    <button
      onClick={toggle}
      aria-label="Change language"
      className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm font-medium bg-white hover:bg-gray-100 shadow-sm"
    >
      <span>🌐</span>
      <span>{locale === "en" ? "EN" : "తెలుగు"}</span>
    </button>
  );
}
