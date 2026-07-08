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
    <div className="flex gap-2 text-sm font-medium">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          disabled={locale === activeLocale}
          onClick={() => router.replace(pathname, { locale })}
          className={
            locale === activeLocale
              ? "text-foreground underline underline-offset-4"
              : "text-foreground/60 hover:text-foreground"
          }
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
