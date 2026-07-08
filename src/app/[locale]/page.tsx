import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isRoundComplete } from "@/domain/tournament/round-completion";
import {
  listPlayersUseCase,
  listTournamentsUseCase,
} from "@/infrastructure/composition-root";
import { buttonClasses } from "@/presentation/components/ui/button";
import { Card } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const [players, tournaments] = await Promise.all([
    listPlayersUseCase.execute(),
    listTournamentsUseCase.execute(),
  ]);

  const isTournamentComplete = (tournament: (typeof tournaments)[number]) => {
    const lastRound = tournament.rounds[tournament.rounds.length - 1];
    return (
      isRoundComplete(lastRound) && tournament.rounds.length >= tournament.roundsPlanned
    );
  };

  const inProgress = [...tournaments].reverse().find((t) => !isTournamentComplete(t));
  const featuredTournament = inProgress ?? tournaments[tournaments.length - 1];

  const familyRatings = players
    .filter((p) => p.type === "family")
    .sort((a, b) => {
      const av = a.officialRating.value;
      const bv = b.officialRating.value;
      if (av !== null && bv !== null) return bv - av;
      if (av !== null) return -1;
      if (bv !== null) return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <div className="relative flex flex-col items-center gap-3 overflow-hidden py-6 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_65%)] opacity-[0.12] blur-2xl"
        />
        <span
          aria-hidden="true"
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-accent-strong to-accent text-3xl text-accent-foreground shadow-lg shadow-accent/30 ring-1 ring-accent/20"
        >
          ♞
        </span>
        <h1 className="relative font-display text-3xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="relative max-w-md text-sm text-muted">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold">
            {t("latestTournamentHeading")}
          </h2>

          {featuredTournament ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{featuredTournament.name}</span>
                <Badge tone={isTournamentComplete(featuredTournament) ? "gold" : "accent"}>
                  {`${featuredTournament.rounds.length} / ${featuredTournament.roundsPlanned}`}
                </Badge>
              </div>
              <Link
                href={`/tournaments/${featuredTournament.id}`}
                className={buttonClasses("primary", "self-start")}
              >
                {isTournamentComplete(featuredTournament)
                  ? t("viewResultsLink")
                  : t("continueTournamentLink")}
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">{t("noTournamentsYet")}</p>
              <Link href="/tournaments/new" className={buttonClasses("primary", "self-start")}>
                {t("createTournamentLink")}
              </Link>
            </>
          )}
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold">
            {t("familyRatingsHeading")}
          </h2>

          {familyRatings.length === 0 ? (
            <p className="text-sm text-muted">{t("noPlayersYet")}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {familyRatings.map((player, index) => (
                <li key={player.id} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className="w-4 text-muted">{index + 1}</span>
                    <span className="font-medium">{player.name}</span>
                  </span>
                  <span className="text-muted">
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
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="flex justify-center gap-3">
        <Link href="/players" className={buttonClasses("secondary")}>
          {t("playersLink")}
        </Link>
        <Link href="/tournaments" className={buttonClasses("secondary")}>
          {t("tournamentsLink")}
        </Link>
      </div>
    </main>
  );
}
