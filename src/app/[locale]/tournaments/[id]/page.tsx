import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getTournamentUseCase } from "@/infrastructure/composition-root";
import { isRoundComplete } from "@/domain/tournament/round-completion";
import { computeStandingsTable } from "@/domain/tournament/compute-standings-table";
import { RoundResultsForm } from "@/presentation/components/round-results-form";
import { PasteResultsForm } from "@/presentation/components/paste-results-form";
import { GenerateNextRoundButton } from "@/presentation/components/generate-next-round-button";

const RESULT_LABEL: Record<string, string> = {
  white: "1-0",
  black: "0-1",
  draw: "½-½",
};

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("TournamentDetailPage");
  const tournament = await getTournamentUseCase.execute(id);

  if (!tournament) {
    notFound();
  }

  const nameById = new Map(tournament.participants.map((p) => [p.playerId, p.name]));
  const lastRound = tournament.rounds[tournament.rounds.length - 1];
  const lastRoundComplete = isRoundComplete(lastRound);
  const canGenerateNextRound =
    lastRoundComplete && tournament.rounds.length < tournament.roundsPlanned;
  const isTournamentComplete =
    lastRoundComplete && tournament.rounds.length >= tournament.roundsPlanned;

  const standings = computeStandingsTable(tournament.participants, tournament.rounds);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{tournament.name}</h1>
        <Link
          href={`/tournaments/${tournament.id}/print`}
          className="mt-1 inline-block text-sm text-foreground/60 underline underline-offset-4"
        >
          {t("printLink")}
        </Link>
      </div>

      {tournament.rounds
        .slice()
        .reverse()
        .map((round) => (
          <section key={round.number} className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">
              {t("roundHeading", { number: round.number })}
            </h2>

            {round.number === lastRound.number && !lastRoundComplete ? (
              <>
                <RoundResultsForm
                  tournamentId={tournament.id}
                  round={round}
                  participants={tournament.participants}
                />
                <PasteResultsForm
                  tournamentId={tournament.id}
                  roundNumber={round.number}
                />
              </>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {round.pairings.map((pairing) => (
                  <li key={pairing.board} className="flex justify-between border-t border-foreground/10 py-1">
                    <span>
                      {t("boardLabel")} {pairing.board}: {nameById.get(pairing.whitePlayerId)}
                      {pairing.blackPlayerId
                        ? ` - ${nameById.get(pairing.blackPlayerId)}`
                        : ` (${t("byeLabel")})`}
                    </span>
                    {pairing.result ? (
                      <span className="font-medium">{RESULT_LABEL[pairing.result]}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

      {canGenerateNextRound ? (
        <GenerateNextRoundButton tournamentId={tournament.id} />
      ) : null}

      {isTournamentComplete ? (
        <p className="text-sm text-foreground/60">{t("tournamentComplete")}</p>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">{t("standingsHeading")}</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/60">
              <th className="font-normal">{t("rankLabel")}</th>
              <th className="font-normal">{t("playerLabel")}</th>
              <th className="font-normal">{t("scoreLabel")}</th>
              <th className="font-normal">{t("buchholzLabel")}</th>
              <th className="font-normal">{t("sonnebornBergerLabel")}</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => (
              <tr key={row.playerId} className="border-t border-foreground/10">
                <td className="py-1">{index + 1}</td>
                <td>{nameById.get(row.playerId) ?? row.playerId}</td>
                <td>{row.score}</td>
                <td>{row.buchholz}</td>
                <td>{row.sonnebornBerger}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
