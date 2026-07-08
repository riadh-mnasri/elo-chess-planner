import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/presentation/components/ui/button";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_65%)] opacity-[0.12] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-[60%] rounded-full bg-[radial-gradient(circle,var(--gold)_0%,transparent_70%)] opacity-[0.15] blur-2xl"
      />

      <span
        aria-hidden="true"
        className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-b from-accent-strong to-accent text-5xl text-accent-foreground shadow-lg shadow-accent/30 ring-1 ring-accent/20"
      >
        ♞
      </span>
      <h1 className="relative font-display text-5xl font-semibold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="relative max-w-md text-lg text-foreground/80">{t("subtitle")}</p>
      <p className="relative max-w-md text-sm text-muted">{t("description")}</p>
      <div className="relative mt-4 flex gap-3">
        <Link href="/players" className={buttonClasses("primary")}>
          {t("playersLink")}
        </Link>
        <Link href="/tournaments" className={buttonClasses("secondary")}>
          {t("tournamentsLink")}
        </Link>
      </div>
    </main>
  );
}
