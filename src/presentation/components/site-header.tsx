"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/players", key: "players" },
  { href: "/tournaments", key: "tournaments" },
] as const;

export function SiteHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-foreground"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-accent-strong to-accent text-base text-accent-foreground shadow-sm shadow-accent/30"
          >
            ♞
          </span>
          EloChessPlanner
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-b from-accent-strong to-accent text-accent-foreground shadow-sm shadow-accent/30"
                    : "text-muted hover:bg-border/60 hover:text-foreground"
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <LocaleSwitcher />
      </div>
    </header>
  );
}
