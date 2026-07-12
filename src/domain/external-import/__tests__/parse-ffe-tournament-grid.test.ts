import { describe, expect, it } from "vitest";
import { parseFfeTournamentGrid } from "../parse-ffe-tournament-grid";

// Trimmed excerpt matching the real markup shape of an FFE "grille
// américaine" (Action=Ga) page for two players, covering a win, a draw and
// a loss across both colors.
const FIXTURE_HTML = `
<table width=800 cellpadding=2 cellspacing=0 style=border-collapse:collapse;>
 <tr class=papi_titre>
  <td colspan=18 align=center>Festival 2026<br />Grille américaine après la ronde 3</td>
 </tr>
 <tr class=papi_small_f>
  <td class=papi_r>1</td>
  <td class=papi_r>&nbsp;</td>
  <td class=papi_l>
  <div class=papi_joueur_box>
    <b>LE GOFF Tudy</b>
    <div class=data align=center>
      <table border=0 cellpadding=2 cellspacing=0 bordercolor=#000000 width=500px>
        <tr class=papi_small_t>
          <td colspan=3>&nbsp;</td>
          <td class=papi_r>1</td>
          <td>&nbsp;</td>
          <td>LE GOFF Tudy</td>
          <td>1806&nbsp;F</td>
          <td>JunM</td>
          <td>FRA</td>
          <td>BRE</td>
          <td>2&frac12;</td>
          <td>235</td>
          <td>&nbsp;</td>
        </tr>
        <tr class=papi_small_c>
          <td>1</td>
          <td>B</td>
          <td>1</td>
          <td class=papi_r>138</td>
          <td>&nbsp;</td>
          <td>PARDIGON MARTINEZ Gabriel</td>
          <td>1672&nbsp;F</td>
          <td>PupM</td>
          <td>FRA</td>
          <td>ARA</td>
          <td>4&frac12;</td>
          <td>98</td>
          <td>&nbsp;</td>
        </tr>
        <tr class=papi_small_f>
          <td>2</td>
          <td>N</td>
          <td>&frac12;</td>
          <td class=papi_r>29</td>
          <td>&nbsp;</td>
          <td>VERLUT Eugene</td>
          <td>1685&nbsp;F</td>
          <td>BenM</td>
          <td>FRA</td>
          <td>IDF</td>
          <td>6</td>
          <td>207</td>
          <td>&nbsp;</td>
        </tr>
        <tr class=papi_small_c>
          <td>3</td>
          <td>B</td>
          <td>0</td>
          <td class=papi_r>22</td>
          <td>&nbsp;</td>
          <td>LECOUR GRANDMAISON Louis</td>
          <td>1652&nbsp;F</td>
          <td>MinM</td>
          <td>FRA</td>
          <td>PDL</td>
          <td>6</td>
          <td>214</td>
          <td>&nbsp;</td>
        </tr>
      </table>
    </div>
  </div>
  </td>
  <td class=papi_r>1806&nbsp;F</td>
  <td class=papi_c>JunM</td>
  <td class=papi_r>+138B</td>
  <td class=papi_r>=&nbsp;29N</td>
  <td class=papi_r>-&nbsp;22B</td>
  <td class=papi_r><b>2&frac12;</b></td>
 </tr>
 <tr class=papi_small_c>
  <td class=papi_r>2</td>
  <td class=papi_r>&nbsp;</td>
  <td class=papi_l>
  <div class=papi_joueur_box>
    <b>VERLUT Eugene</b>
    <div class=data align=center>
      <table border=0 cellpadding=2 cellspacing=0 bordercolor=#000000 width=500px>
        <tr class=papi_small_t>
          <td colspan=3>&nbsp;</td>
          <td class=papi_r>29</td>
          <td>&nbsp;</td>
          <td>VERLUT Eugene</td>
          <td>1685&nbsp;F</td>
          <td>BenM</td>
          <td>FRA</td>
          <td>IDF</td>
          <td>1&frac12;</td>
          <td>207</td>
          <td>&nbsp;</td>
        </tr>
      </table>
    </div>
  </div>
  </td>
  <td class=papi_r>1685&nbsp;F</td>
 </tr>
</table>
`;

describe("parseFfeTournamentGrid", () => {
  it("extracts a player's starting rating and round-by-round record by exact name match", () => {
    // Given a results grid with two players
    // When parsing the record for "LE GOFF Tudy"
    const record = parseFfeTournamentGrid(FIXTURE_HTML, "LE GOFF Tudy");

    // Then the player's own rating and all three rounds are returned
    expect(record).not.toBeNull();
    expect(record!.playerRating).toBe(1806);
    expect(record!.games).toEqual([
      {
        round: 1,
        color: "white",
        result: "win",
        opponentName: "PARDIGON MARTINEZ Gabriel",
        opponentRating: 1672,
      },
      {
        round: 2,
        color: "black",
        result: "draw",
        opponentName: "VERLUT Eugene",
        opponentRating: 1685,
      },
      {
        round: 3,
        color: "white",
        result: "loss",
        opponentName: "LECOUR GRANDMAISON Louis",
        opponentRating: 1652,
      },
    ]);
  });

  it("matches names case-insensitively and ignoring surrounding whitespace", () => {
    // Given the same fixture
    // When searching with a differently-cased, padded name
    const record = parseFfeTournamentGrid(FIXTURE_HTML, "  le goff tudy  ");

    // Then the player is still found
    expect(record).not.toBeNull();
    expect(record!.games).toHaveLength(3);
  });

  it("matches names given in 'Prénom Nom' order against FFE's 'NOM Prénom' print", () => {
    // Given the same fixture, where FFE prints "LE GOFF Tudy"
    // When searching with the app's first-name-first form
    const record = parseFfeTournamentGrid(FIXTURE_HTML, "Tudy Le Goff");

    // Then the player is still found
    expect(record).not.toBeNull();
    expect(record!.games).toHaveLength(3);
  });

  it("matches names ignoring accents", () => {
    // Given the same fixture, where FFE prints "VERLUT Eugene" without accent
    // When searching with an accented spelling
    const record = parseFfeTournamentGrid(FIXTURE_HTML, "Eugène Verlut");

    // Then the player is still found
    expect(record).not.toBeNull();
  });

  it("returns null when no player matches the given name", () => {
    // Given the fixture
    // When searching for a name that isn't in the tournament
    const record = parseFfeTournamentGrid(FIXTURE_HTML, "NOBODY Here");

    // Then nothing is returned
    expect(record).toBeNull();
  });
});
