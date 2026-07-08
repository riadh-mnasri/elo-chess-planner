import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  listExternalGamesUseCase,
  listPlayersUseCase,
} from "@/infrastructure/composition-root";
import { ImportCsvForm } from "@/presentation/components/import-csv-form";
import { SyncExternalGamesForm } from "@/presentation/components/sync-external-games-form";
import { Card } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";

export default async function ImportGamesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("ImportPage");
  const players = await listPlayersUseCase.execute();
  const player = players.find((p) => p.id === id);

  if (!player) {
    notFound();
  }

  const games = (await listExternalGamesUseCase.execute(id)).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  const resultLabel = { win: t("resultWin"), loss: t("resultLoss"), draw: t("resultDraw") };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <Link href="/players" className="text-sm text-accent hover:underline underline-offset-4">
          {t("backLink")}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          {t("title", { name: player.name })}
        </h1>
      </div>

      <Card className="flex flex-col gap-4">
        <ImportCsvForm playerId={player.id} />
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">{t("syncHeading")}</h2>
        <SyncExternalGamesForm playerId={player.id} source="chesscom" />
        <SyncExternalGamesForm playerId={player.id} source="lichess" />
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">{t("historyHeading")}</h2>

        {games.length === 0 ? (
          <p className="text-sm text-muted">{t("historyEmpty")}</p>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="px-4 py-2 font-normal">{t("dateLabel")}</th>
                  <th className="px-4 py-2 font-normal">{t("sourceLabel")}</th>
                  <th className="px-4 py-2 font-normal">{t("opponentLabel")}</th>
                  <th className="px-4 py-2 font-normal">{t("resultLabel")}</th>
                  <th className="px-4 py-2 font-normal">{t("ratingChangeLabel")}</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 text-muted">
                      {game.date.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge tone="gold">{game.source.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-2">{game.opponent}</td>
                    <td className="px-4 py-2">
                      <Badge
                        tone={
                          game.result === "win"
                            ? "accent"
                            : game.result === "loss"
                              ? "danger"
                              : "neutral"
                        }
                      >
                        {resultLabel[game.result]}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-muted">
                      {game.eloBefore !== null ? `${game.eloBefore} → ` : ""}
                      {game.eloAfter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </main>
  );
}
