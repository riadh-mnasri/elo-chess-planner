import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listTournamentsUseCase } from "@/infrastructure/composition-root";
import { buttonClasses } from "@/presentation/components/ui/button";
import { Card } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";
import { EmptyState } from "@/presentation/components/ui/empty-state";
import { ConfirmSubmitButton } from "@/presentation/components/confirm-submit-button";
import { removeTournamentAction } from "./actions";

export default async function TournamentsPage() {
  const t = await getTranslations("TournamentsPage");
  const tournaments = await listTournamentsUseCase.execute();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("description")}</p>
        </div>
        <Link href="/tournaments/new" className={buttonClasses("primary", "shrink-0")}>
          {t("newTournamentButton")}
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <EmptyState icon={<span className="text-4xl">🏆</span>} message={t("emptyState")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {tournaments.map((tournament) => {
            const isComplete = tournament.rounds.length >= tournament.roundsPlanned;
            return (
              <li key={tournament.id}>
                <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:border-accent/40">
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="flex flex-1 items-center justify-between gap-3"
                  >
                    <span className="font-medium">{tournament.name}</span>
                    <Badge tone={isComplete ? "gold" : "accent"}>
                      {t("roundsProgress", {
                        current: tournament.rounds.length,
                        total: tournament.roundsPlanned,
                      })}
                    </Badge>
                  </Link>
                  <form action={removeTournamentAction}>
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                    <ConfirmSubmitButton
                      confirmMessage={t("removeConfirm", { name: tournament.name })}
                      className="ml-3 shrink-0 text-xs font-medium text-danger hover:underline"
                    >
                      {t("removeButton")}
                    </ConfirmSubmitButton>
                  </form>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
