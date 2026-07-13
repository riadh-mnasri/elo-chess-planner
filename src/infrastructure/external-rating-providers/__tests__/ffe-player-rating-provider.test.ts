import { describe, expect, it, vi } from "vitest";
import { FfeHtmlPlayerRatingProvider } from "../ffe-player-rating-provider";

function searchResults(rows: string) {
  return `
<table border=0 cellspacing=0 cellpadding=4 width=100%>
    <tr class=liste_titre><td>NrFFE</td><td>Nom et Prénom</td><td>Af.</td><td>Info</td><td>Elo</td></tr>
    ${rows}
</table>`;
}

const SEJI_ROW = `
    <tr class=liste_fonce>
      <td align=center>X57544</td>
      <td align=left>MNASRI Seji</td>
      <td align=center>A</td>
      <td align=center><a href=FicheJoueur.aspx?Id=1201092></a></td>
      <td align=right>1738&nbsp;F</td>
    </tr>`;

function textResponse(body: string, ok = true) {
  return { ok, text: async () => body } as Response;
}

describe("FfeHtmlPlayerRatingProvider", () => {
  it("searches each word of the name and returns the matched member's rating", async () => {
    // Given a registry where only the family-name search returns rows
    const fetchFn = vi.fn(async (_url: string, init?: RequestInit) => {
      const query = (init?.body as URLSearchParams).get("JoueurNom");
      return textResponse(searchResults(query === "MNASRI" ? SEJI_ROW : ""));
    });
    const provider = new FfeHtmlPlayerRatingProvider(fetchFn as unknown as typeof fetch);

    // When syncing from the app's "Prénom Nom" spelling
    const fetched = await provider.fetchPlayerRating("Seji MNASRI");

    // Then the row is found and the F letter maps to a FIDE-published rating
    expect(fetched).toEqual({
      nrFfe: "X57544",
      printedName: "MNASRI Seji",
      elo: 1738,
      source: "fide",
    });
  });

  it("maps a national (N) rating to the ffe source", async () => {
    const row = SEJI_ROW.replace("1738&nbsp;F", "1420&nbsp;N");
    const fetchFn = vi.fn(async () => textResponse(searchResults(row)));
    const provider = new FfeHtmlPlayerRatingProvider(fetchFn as unknown as typeof fetch);

    const fetched = await provider.fetchPlayerRating("Seji MNASRI");

    expect(fetched.elo).toBe(1420);
    expect(fetched.source).toBe("ffe");
  });

  it("lists nearby registry entries when the exact player is not found", async () => {
    const fetchFn = vi.fn(async () => textResponse(searchResults(SEJI_ROW)));
    const provider = new FfeHtmlPlayerRatingProvider(fetchFn as unknown as typeof fetch);

    await expect(provider.fetchPlayerRating("Sana MNASRI")).rejects.toThrow(
      /no registered player found for "Sana MNASRI".*MNASRI Seji/,
    );
  });

  it("throws a clear error for a member without a published rating", async () => {
    const row = SEJI_ROW.replace("1738&nbsp;F", "&nbsp;");
    const fetchFn = vi.fn(async () => textResponse(searchResults(row)));
    const provider = new FfeHtmlPlayerRatingProvider(fetchFn as unknown as typeof fetch);

    await expect(provider.fetchPlayerRating("Seji MNASRI")).rejects.toThrow(
      /no published rating yet/,
    );
  });
});
