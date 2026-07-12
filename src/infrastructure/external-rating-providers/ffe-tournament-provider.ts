import type { FetchedExternalGame } from "@/application/ports/external-rating-provider";
import type { FfeTournamentProvider } from "@/application/ports/ffe-tournament-provider";
import {
  parseFfeTournamentGrid,
  suggestClosestFfePlayerNames,
} from "@/domain/external-import/parse-ffe-tournament-grid";
import { simulateFfeEloProgression } from "@/domain/external-import/simulate-ffe-elo-progression";
import { parseFfeDateRange, spreadDatesAcrossRounds } from "@/domain/external-import/ffe-tournament-dates";

const RESULTS_URL_REGEX = /Resultats\.aspx\?URL=([^"'&]+)/;

// Reads a public FFE (echecs.asso.fr) tournament fiche page, follows it to
// the "grille américaine" results grid, and reconstructs one player's
// round-by-round game history with a simulated rating curve (see
// simulateFfeEloProgression - FFE only publishes a rating snapshot once per
// tournament, not per game).
export class FfeHtmlTournamentProvider implements FfeTournamentProvider {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async fetchTournamentGames(
    tournamentUrl: string,
    playerName: string,
    age: number | null,
  ): Promise<FetchedExternalGame[]> {
    const ficheResponse = await this.fetchFn(tournamentUrl);
    if (!ficheResponse.ok) {
      throw new Error("FFE: could not fetch the tournament page");
    }
    const ficheHtml = await ficheResponse.text();

    const resultsMatch = ficheHtml.match(RESULTS_URL_REGEX);
    if (!resultsMatch) {
      throw new Error("FFE: could not find a results link on this tournament page");
    }

    const origin = new URL(tournamentUrl).origin;
    const gridUrl = `${origin}/Resultats.aspx?URL=${resultsMatch[1]}&Action=Ga`;

    const gridResponse = await this.fetchFn(gridUrl);
    if (!gridResponse.ok) {
      throw new Error("FFE: could not fetch the results grid");
    }
    const gridHtml = await gridResponse.text();

    const record = parseFfeTournamentGrid(gridHtml, playerName);
    if (!record || record.games.length === 0) {
      const suggestions = suggestClosestFfePlayerNames(gridHtml, playerName);
      const hint =
        suggestions.length > 0 ? ` Did you mean: ${suggestions.join(", ")}?` : "";
      throw new Error(`FFE: no games found for "${playerName}" in this tournament.${hint}`);
    }
    if (record.playerRating === null) {
      throw new Error(`FFE: could not read a starting rating for "${playerName}"`);
    }

    const dateRange = parseFfeDateRange(ficheHtml);
    const dates = dateRange
      ? spreadDatesAcrossRounds(
          dateRange,
          record.games.map((g) => g.round),
        )
      : record.games.map(() => new Date());

    const simulated = simulateFfeEloProgression({
      startingRating: record.playerRating,
      age,
      games: record.games.map((g) => ({
        round: g.round,
        result: g.result,
        opponentRating: g.opponentRating ?? (record.playerRating as number),
      })),
    });

    return simulated.map((game, index) => ({
      date: dates[index],
      opponent: record.games[index].opponentName,
      result: game.result,
      eloBefore: game.eloBefore,
      eloAfter: game.eloAfter,
    })) satisfies FetchedExternalGame[];
  }
}
