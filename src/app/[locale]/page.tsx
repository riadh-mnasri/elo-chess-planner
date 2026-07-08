import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/presentation/components/ui/button";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <span
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-4xl text-accent"
      >
        ♞
      </span>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="max-w-md text-lg text-foreground/80">{t("subtitle")}</p>
      <p className="max-w-md text-sm text-muted">{t("description")}</p>
      <div className="mt-4 flex gap-3">
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
