"use client";

import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

const localeLabels: Record<string, string> = {
  en: "EN",
  fr: "FR",
};

export function LocaleSwitcher() {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex gap-1 rounded-full border border-border p-0.5 text-sm font-medium">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          disabled={locale === activeLocale}
          onClick={() => router.replace(pathname, { locale })}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === activeLocale
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
