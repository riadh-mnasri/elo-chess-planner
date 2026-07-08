import { getTranslations } from "next-intl/server";
import { listPlayersUseCase } from "@/infrastructure/composition-root";
import { NewTournamentForm } from "@/presentation/components/new-tournament-form";

export default async function NewTournamentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("NewTournamentPage");
  const players = await listPlayersUseCase.execute();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <NewTournamentForm players={players} locale={locale} />
    </main>
  );
}
