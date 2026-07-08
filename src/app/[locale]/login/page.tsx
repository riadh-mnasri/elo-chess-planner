import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/presentation/components/login-form";
import { Card } from "@/presentation/components/ui/card";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale } = await params;
  const { from } = await searchParams;
  const t = await getTranslations("LoginPage");

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_65%)] opacity-[0.1] blur-2xl"
      />
      <span
        aria-hidden="true"
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-accent-strong to-accent text-3xl text-accent-foreground shadow-lg shadow-accent/30"
      >
        ♞
      </span>
      <Card className="relative flex w-full max-w-sm flex-col gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("description")}</p>
        </div>
        <LoginForm locale={locale} from={from ?? `/${locale}`} />
      </Card>
    </main>
  );
}
