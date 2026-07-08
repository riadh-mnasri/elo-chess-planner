import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="text-5xl" aria-hidden="true">
        ♞
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="max-w-md text-lg text-foreground/70">{t("subtitle")}</p>
      <p className="max-w-md text-sm text-foreground/50">
        {t("description")}
      </p>
      <div className="mt-4 flex gap-3">
        <Link
          href="/players"
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          {t("playersLink")}
        </Link>
        <Link
          href="/tournaments"
          className="rounded border border-foreground/20 px-4 py-2 text-sm font-medium"
        >
          {t("tournamentsLink")}
        </Link>
      </div>
    </main>
  );
}
