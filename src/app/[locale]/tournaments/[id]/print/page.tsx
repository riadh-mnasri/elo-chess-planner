import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getTournamentUseCase } from "@/infrastructure/composition-root";

export default async function TournamentPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("PrintPage");
  const tournament = await getTournamentUseCase.execute(id);

  if (!tournament) {
    notFound();
  }

  const nameById = new Map(tournament.participants.map((p) => [p.playerId, p.name]));
  const round = tournament.rounds[tournament.rounds.length - 1];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-12 print:px-0 print:py-4">
      <h1 className="font-display text-2xl font-semibold">{tournament.name}</h1>
      <h2 className="text-lg font-medium text-muted">
        {t("roundHeading", { number: round.number })}
      </h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-foreground/30 px-2 py-1 text-left">
              {t("boardLabel")}
            </th>
            <th className="border border-foreground/30 px-2 py-1 text-left">
              {t("whiteLabel")}
            </th>
            <th className="border border-foreground/30 px-2 py-1 text-left">
              {t("blackLabel")}
            </th>
            <th className="border border-foreground/30 px-2 py-1 text-left">
              {t("resultLabel")}
            </th>
          </tr>
        </thead>
        <tbody>
          {round.pairings.map((pairing) => (
            <tr key={pairing.board}>
              <td className="border border-foreground/30 px-2 py-1">{pairing.board}</td>
              <td className="border border-foreground/30 px-2 py-1">
                {nameById.get(pairing.whitePlayerId) ?? pairing.whitePlayerId}
              </td>
              <td className="border border-foreground/30 px-2 py-1">
                {pairing.blackPlayerId
                  ? nameById.get(pairing.blackPlayerId) ?? pairing.blackPlayerId
                  : t("byeLabel")}
              </td>
              <td className="border border-foreground/30 px-2 py-1" />
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
