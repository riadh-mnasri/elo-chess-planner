import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getTournamentUseCase } from "@/infrastructure/composition-root";
import { isRoundComplete } from "@/domain/tournament/round-completion";
import { AutoRefresh } from "@/presentation/components/auto-refresh";

const RESULT_LABEL: Record<string, string> = {
  white: "1-0",
  black: "0-1",
  draw: "½-½",
};

export default async function TournamentDisplayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("DisplayPage");
  const tournament = await getTournamentUseCase.execute(id);

  if (!tournament) {
    notFound();
  }

  const nameById = new Map(tournament.participants.map((p) => [p.playerId, p.name]));
  const round = tournament.rounds[tournament.rounds.length - 1];
  const lastRoundComplete = isRoundComplete(round);
  const isTournamentComplete =
    lastRoundComplete && tournament.rounds.length >= tournament.roundsPlanned;

  return (
    <main className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#15130f] px-6 py-10 text-[#f5f1e8] sm:px-12">
      <AutoRefresh />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">
              {tournament.name}
            </h1>
            <p className="mt-1 text-lg text-[#c9beac] sm:text-xl">
              {isTournamentComplete
                ? t("tournamentComplete")
                : t("roundHeading", { number: round.number })}
            </p>
          </div>
          <Link
            href={`/tournaments/${tournament.id}`}
            className="rounded-full border border-[#3a3427] px-4 py-2 text-sm text-[#c9beac] hover:bg-[#211d16]"
          >
            {t("exitLink")}
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-6">
          {round.pairings.map((pairing) => (
            <div
              key={pairing.board}
              className="flex flex-col items-center gap-2 rounded-3xl border border-[#3a3427] bg-[#1c1811] px-8 py-6 sm:flex-row sm:justify-between sm:gap-6"
            >
              <span className="font-display text-xl text-[#8fae9c] sm:w-20 sm:text-2xl">
                #{pairing.board}
              </span>
              <div className="flex flex-1 flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-6">
                <span className="font-display text-3xl font-semibold sm:text-4xl">
                  {nameById.get(pairing.whitePlayerId) ?? pairing.whitePlayerId}
                </span>
                {pairing.blackPlayerId ? (
                  <>
                    <span className="text-xl text-[#8a8171] sm:text-2xl">vs</span>
                    <span className="font-display text-3xl font-semibold sm:text-4xl">
                      {nameById.get(pairing.blackPlayerId) ?? pairing.blackPlayerId}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl text-[#d4a24e]">{t("byeLabel")}</span>
                )}
              </div>
              <span className="font-display text-2xl text-[#d4a24e] sm:w-24 sm:text-right sm:text-3xl">
                {pairing.result ? RESULT_LABEL[pairing.result] : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
