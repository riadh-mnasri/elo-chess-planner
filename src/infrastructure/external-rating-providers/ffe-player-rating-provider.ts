import type {
  FetchedFfePlayerRating,
  FfePlayerRatingProvider,
} from "@/application/ports/ffe-player-rating-provider";
import {
  findFfePlayerRow,
  parseFfePlayerSearch,
} from "@/domain/external-import/parse-ffe-player-search";

const SEARCH_URL = "https://www.echecs.asso.fr/ListeJoueurs.aspx?Action=FFE";

// Queries the public FFE member search (echecs.asso.fr) for a player's
// current ratings. The search form only matches the beginning of the family
// name, and the app doesn't know which word of the stored name is the family
// name - so each word is tried as a search term (longest first, the family
// name usually being the more distinctive one) until a row matches.
export class FfeHtmlPlayerRatingProvider implements FfePlayerRatingProvider {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async fetchPlayerRating(playerName: string): Promise<FetchedFfePlayerRating> {
    const words = [...new Set(playerName.trim().split(/\s+/).filter((w) => w.length >= 2))]
      .sort((a, b) => b.length - a.length);
    if (words.length === 0) {
      throw new Error("FFE: player name is blank");
    }

    const seenNames = new Set<string>();
    for (const word of words) {
      const response = await this.fetchFn(SEARCH_URL, {
        method: "POST",
        body: new URLSearchParams({ JoueurNom: word }),
      });
      if (!response.ok) {
        throw new Error("FFE: could not search the member registry");
      }

      const rows = parseFfePlayerSearch(await response.text());
      const match = findFfePlayerRow(rows, playerName);
      if (match) {
        if (match.elo === null) {
          throw new Error(`FFE: "${match.name}" has no published rating yet`);
        }
        return {
          nrFfe: match.nrFfe,
          printedName: match.name,
          elo: match.elo,
          source: match.eloType === "F" ? "fide" : "ffe",
        };
      }
      for (const row of rows) seenNames.add(row.name);
    }

    const hint =
      seenNames.size > 0
        ? ` Closest registry entries: ${[...seenNames].slice(0, 3).join(", ")}.`
        : "";
    throw new Error(`FFE: no registered player found for "${playerName}".${hint}`);
  }
}
