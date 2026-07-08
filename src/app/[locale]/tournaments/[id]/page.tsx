import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getTournamentUseCase } from "@/infrastructure/composition-root";
import { isRoundComplete } from "@/domain/tournament/round-completion";
import { computeStandingsTable } from "@/domain/tournament/compute-standings-table";
import { RoundResultsForm } from "@/presentation/components/round-results-form";
import { PasteResultsForm } from "@/presentation/components/paste-results-form";
import { GenerateNextRoundButton } from "@/presentation/components/generate-next-round-button";
import { Card } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";

const RESULT_LABEL: Record<string, string> = {
  white: "1-0",
  black: "0-1",
  draw: "½-½",
};

const MEDALS = ["🥇", "🥈", "🥉"];

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {tournament.name}
          </h1>
          <Badge tone={isTournamentComplete ? "gold" : "accent"} className="mt-2">
            {`${tournament.rounds.length} / ${tournament.roundsPlanned}`}
          </Badge>
        </div>
        <Link
          href={`/tournaments/${tournament.id}/print`}
          className="text-sm font-medium text-accent hover:underline underline-offset-4"
        >
          {t("printLink")}
        </Link>
      </div>

      {tournament.rounds
        .slice()
        .reverse()
        .map((round) => (
          <Card key={round.number} className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-semibold">
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
              <ul className="flex flex-col gap-2 text-sm">
                {round.pairings.map((pairing) => (
                  <li
                    key={pairing.board}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <span>
                      <span className="text-muted">
                        {t("boardLabel")} {pairing.board}
                      </span>{" "}
                      {nameById.get(pairing.whitePlayerId)}
                      {pairing.blackPlayerId ? (
                        <>
                          {" "}
                          <span className="text-muted">vs</span>{" "}
                          {nameById.get(pairing.blackPlayerId)}
                        </>
                      ) : null}
                    </span>
                    {pairing.result ? (
                      <Badge tone="accent">{RESULT_LABEL[pairing.result]}</Badge>
                    ) : pairing.blackPlayerId === null ? (
                      <Badge tone="gold">{t("byeLabel")}</Badge>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}

      {canGenerateNextRound ? (
        <GenerateNextRoundButton tournamentId={tournament.id} />
      ) : null}

      {isTournamentComplete ? (
        <p className="text-sm text-muted">{t("tournamentComplete")}</p>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">{t("standingsHeading")}</h2>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 py-2 font-normal">{t("rankLabel")}</th>
                <th className="px-4 py-2 font-normal">{t("playerLabel")}</th>
                <th className="px-4 py-2 font-normal">{t("scoreLabel")}</th>
                <th className="px-4 py-2 font-normal">{t("buchholzLabel")}</th>
                <th className="px-4 py-2 font-normal">{t("sonnebornBergerLabel")}</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, index) => {
                const isWinner = isTournamentComplete && index === 0;
                return (
                  <tr
                    key={row.playerId}
                    className={`border-b border-border last:border-0 transition-colors ${
                      isWinner ? "bg-gold/10" : "odd:bg-background/50"
                    }`}
                  >
                    <td className="px-4 py-2">
                      {isTournamentComplete && index < 3 ? (
                        <span className="text-xl leading-none" aria-label={`#${index + 1}`}>
                          {MEDALS[index]}
                        </span>
                      ) : (
                        <span className="text-muted">{index + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {nameById.get(row.playerId) ?? row.playerId}
                        {isWinner ? (
                          <span aria-hidden="true" className="text-base leading-none">
                            🎉
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-2">{row.score}</td>
                    <td className="px-4 py-2 text-muted">{row.buchholz}</td>
                    <td className="px-4 py-2 text-muted">{row.sonnebornBerger}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </section>
    </main>
  );
}
