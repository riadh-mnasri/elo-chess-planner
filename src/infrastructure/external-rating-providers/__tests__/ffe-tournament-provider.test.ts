import { describe, expect, it, vi } from "vitest";
import { FfeHtmlTournamentProvider } from "../ffe-tournament-provider";

const FICHE_HTML = `
<html>
<body>
<span id="ctl00_ContentPlaceHolderMain_LabelDates">samedi 04 juillet 2026 - dimanche 05 juillet 2026</span>
<a href="Resultats.aspx?URL=Tournois/Id/70274/70274&amp;Action=Ls">Joueurs</a>
</body>
</html>
`;

const GRID_HTML = `
<table>
 <tr class=papi_small_f>
  <td class=papi_l>
  <div class=papi_joueur_box>
    <b>MNASRI Seji</b>
    <div class=data align=center>
      <table>
        <tr class=papi_small_t>
          <td colspan=3>&nbsp;</td>
          <td class=papi_r>1</td>
          <td>&nbsp;</td>
          <td>MNASRI Seji</td>
          <td>1738&nbsp;F</td>
          <td>PupM</td>
          <td>FRA</td>
          <td>IDF</td>
          <td>2</td>
          <td>50</td>
          <td>&nbsp;</td>
        </tr>
        <tr class=papi_small_c>
          <td>1</td>
          <td>B</td>
          <td>1</td>
          <td class=papi_r>30</td>
          <td>&nbsp;</td>
          <td>DUPONT Jean</td>
          <td>1700&nbsp;F</td>
          <td>SenM</td>
          <td>FRA</td>
          <td>IDF</td>
          <td>3</td>
          <td>10</td>
          <td>&nbsp;</td>
        </tr>
        <tr class=papi_small_f>
          <td>2</td>
          <td>N</td>
          <td>1</td>
          <td class=papi_r>12</td>
          <td>&nbsp;</td>
          <td>MARTIN Alice</td>
          <td>1750&nbsp;F</td>
          <td>SenF</td>
          <td>FRA</td>
          <td>IDF</td>
          <td>4</td>
          <td>5</td>
          <td>&nbsp;</td>
        </tr>
      </table>
    </div>
  </div>
  </td>
 </tr>
</table>
`;

function textResponse(body: string, ok = true) {
  return { ok, text: async () => body } as Response;
}

describe("FfeHtmlTournamentProvider", () => {
  it("fetches the fiche then the results grid, and returns a simulated rating curve", async () => {
    // Given a tournament fiche page and its results grid
    const fetchFn = vi.fn(async (url: string) => {
      if (url.includes("FicheTournoi.aspx")) return textResponse(FICHE_HTML);
      if (url.includes("Action=Ga")) return textResponse(GRID_HTML);
      throw new Error(`Unexpected URL: ${url}`);
    });
    const provider = new FfeHtmlTournamentProvider(fetchFn as unknown as typeof fetch);

    // When importing Seji's games from this tournament
    const games = await provider.fetchTournamentGames(
      "https://www.echecs.asso.fr/FicheTournoi.aspx?Ref=70274",
      "MNASRI Seji",
      12,
    );

    // Then both rounds are returned, dated across the two-day span, with a
    // chained rating curve starting from the player's listed rating
    expect(games).toHaveLength(2);
    expect(games[0]).toMatchObject({
      date: new Date(Date.UTC(2026, 6, 4)),
      opponent: "DUPONT Jean",
      result: "win",
      eloBefore: 1738,
    });
    expect(games[1]).toMatchObject({
      date: new Date(Date.UTC(2026, 6, 5)),
      opponent: "MARTIN Alice",
      result: "win",
      eloBefore: games[0].eloAfter,
    });
    expect(fetchFn).toHaveBeenCalledWith(
      "https://www.echecs.asso.fr/Resultats.aspx?URL=Tournois/Id/70274/70274&Action=Ga",
    );
  });

  it("throws a clear error when the player isn't found in the tournament", async () => {
    // Given the same fixtures but a name that never played
    const fetchFn = vi.fn(async (url: string) => {
      if (url.includes("FicheTournoi.aspx")) return textResponse(FICHE_HTML);
      return textResponse(GRID_HTML);
    });
    const provider = new FfeHtmlTournamentProvider(fetchFn as unknown as typeof fetch);

    // When / Then importing for an unknown player rejects
    await expect(
      provider.fetchTournamentGames(
        "https://www.echecs.asso.fr/FicheTournoi.aspx?Ref=70274",
        "NOBODY Here",
        null,
      ),
    ).rejects.toThrow(/no games found/i);
  });

  it("throws when the fiche page has no results link", async () => {
    // Given a fiche page without a Resultats.aspx link
    const fetchFn = vi.fn(async () => textResponse("<html></html>"));
    const provider = new FfeHtmlTournamentProvider(fetchFn as unknown as typeof fetch);

    // When / Then fetching rejects instead of silently failing
    await expect(
      provider.fetchTournamentGames(
        "https://www.echecs.asso.fr/FicheTournoi.aspx?Ref=70274",
        "MNASRI Seji",
        null,
      ),
    ).rejects.toThrow(/results link/i);
  });
});
