import { useTranslations } from "next-intl";

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
    </main>
  );
}
