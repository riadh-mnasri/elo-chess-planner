import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listPlayersUseCase } from "@/infrastructure/composition-root";
import { PlayerForm } from "@/presentation/components/player-form";
import { Card } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";
import { removePlayerAction } from "./actions";

export default async function PlayersPage() {
  const t = await getTranslations("PlayersPage");
  const players = await listPlayersUseCase.execute();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("description")}</p>
      </div>

      <PlayerForm />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">{t("listHeading")}</h2>

        {players.length === 0 ? (
          <p className="text-sm text-muted">{t("emptyState")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {players.map((player) => (
              <li key={player.id}>
                <Card className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-accent-strong to-accent font-display text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/20">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        <Badge tone={player.type === "family" ? "accent" : "neutral"}>
                          {player.type === "family" ? t("typeFamily") : t("typeGuest")}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted">
                        {player.officialRating.value !== null ? (
                          <>
                            {player.officialRating.value}{" "}
                            <Badge tone="gold">
                              {player.officialRating.source.toUpperCase()}
                            </Badge>
                          </>
                        ) : (
                          t("ratingUnrated")
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Link
                      href={`/players/${player.id}/import`}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      {t("importLink")}
                    </Link>
                    <form action={removePlayerAction}>
                      <input type="hidden" name="playerId" value={player.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-danger hover:underline"
                      >
                        {t("removeButton")}
                      </button>
                    </form>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
