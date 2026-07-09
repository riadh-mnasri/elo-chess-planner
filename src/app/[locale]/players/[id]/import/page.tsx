import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getEloForecastUseCase,
  listExternalGamesUseCase,
  listPlayersUseCase,
} from "@/infrastructure/composition-root";
import { ImportCsvForm } from "@/presentation/components/import-csv-form";
import { SyncExternalGamesForm } from "@/presentation/components/sync-external-games-form";
import { Card } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";
import { EmptyState } from "@/presentation/components/ui/empty-state";

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
  const forecast = await getEloForecastUseCase.execute(id, new Date());

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

      {forecast ? (
        <Card className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">{t("forecastHeading")}</h2>
          {forecast.currentRating !== null ? (
            <p className="text-sm text-muted">
              {t("forecastCurrentRating", { rating: forecast.currentRating })}
            </p>
          ) : null}
          {forecast.basis === "statistical" ? (
            <>
              <p className="font-display text-2xl font-semibold text-accent">
                {t("forecastRange", {
                  min: forecast.projectedDeltaMin > 0
                    ? `+${forecast.projectedDeltaMin}`
                    : forecast.projectedDeltaMin,
                  max: forecast.projectedDeltaMax > 0
                    ? `+${forecast.projectedDeltaMax}`
                    : forecast.projectedDeltaMax,
                  median: forecast.projectedDeltaMedian > 0
                    ? `+${forecast.projectedDeltaMedian}`
                    : forecast.projectedDeltaMedian,
                })}
              </p>
              <p className="text-xs text-muted">
                {t("forecastBasis", {
                  gamesPerMonth: forecast.gamesPerMonthEstimate,
                  kFactor: forecast.kFactor,
                })}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">{t("forecastInsufficientData")}</p>
          )}
        </Card>
      ) : null}

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
          <EmptyState icon={<span className="text-4xl">📈</span>} message={t("historyEmpty")} />
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
