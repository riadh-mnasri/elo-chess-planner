import { getTranslations } from "next-intl/server";
import { listPlayersUseCase } from "@/infrastructure/composition-root";
import { PlayerForm } from "@/presentation/components/player-form";
import { removePlayerAction } from "./actions";

export default async function PlayersPage() {
  const t = await getTranslations("PlayersPage");
  const players = await listPlayersUseCase.execute();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-foreground/60">{t("description")}</p>
      </div>

      <PlayerForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">{t("listHeading")}</h2>

        {players.length === 0 ? (
          <p className="text-sm text-foreground/60">{t("emptyState")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {players.map((player) => (
              <li
                key={player.id}
                className="flex items-center justify-between rounded border border-foreground/10 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{player.name}</span>
                  <span className="rounded bg-foreground/10 px-2 py-0.5 text-xs uppercase tracking-wide">
                    {player.type === "family" ? t("typeFamily") : t("typeGuest")}
                  </span>
                  <span className="text-foreground/60">
                    {player.officialRating.value !== null
                      ? `${player.officialRating.value} (${player.officialRating.source.toUpperCase()})`
                      : t("ratingUnrated")}
                  </span>
                </div>
                <form action={removePlayerAction}>
                  <input type="hidden" name="playerId" value={player.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:underline"
                  >
                    {t("removeButton")}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
