import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = new Set(["en", "te"]);

export default getRequestConfig(async ({ locale }) => {
  const candidateLocale = locale ?? "en";
  const resolvedLocale = SUPPORTED_LOCALES.has(candidateLocale) ? candidateLocale : "en";

  return {
    locale: resolvedLocale,
    timeZone: "Asia/Kolkata",
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  };
});