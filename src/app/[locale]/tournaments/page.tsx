import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listTournamentsUseCase } from "@/infrastructure/composition-root";

export default async function TournamentsPage() {
  const t = await getTranslations("TournamentsPage");
  const tournaments = await listTournamentsUseCase.execute();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-foreground/60">{t("description")}</p>
        </div>
        <Link
          href="/tournaments/new"
          className="shrink-0 rounded bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          {t("newTournamentButton")}
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-sm text-foreground/60">{t("emptyState")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tournaments.map((tournament) => (
            <li key={tournament.id}>
              <Link
                href={`/tournaments/${tournament.id}`}
                className="flex items-center justify-between rounded border border-foreground/10 px-3 py-2 text-sm hover:bg-foreground/5"
              >
                <span className="font-medium">{tournament.name}</span>
                <span className="text-foreground/60">
                  {t("roundsProgress", {
                    current: tournament.rounds.length,
                    total: tournament.roundsPlanned,
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
