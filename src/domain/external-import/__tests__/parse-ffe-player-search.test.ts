import { describe, expect, it } from "vitest";
import {
  findFfePlayerRow,
  parseFfePlayerSearch,
} from "../parse-ffe-player-search";

// Trimmed excerpt matching the real markup of an FFE member search results
// page (ListeJoueurs.aspx?Action=FFE). Quirks kept on purpose: the first
// row's name cell wraps the name in an unclosed mailto link, and rating
// cells use &nbsp; before the origin letter.
const FIXTURE_HTML = `
<table border=0 cellspacing=0 cellpadding=4 width=100%>
    <tr class=liste_titre>
      <td align=center width=60>NrFFE</td>
      <td align=left width=200>Nom et Prénom</td>
      <td align=center width=30>Af.</td>
      <td align=center width=30>Info</td>
      <td align=center width=45>Elo</td>
      <td align=center width=45>Rapide</td>
      <td align=center width=45>Blitz</td>
      <td align=center width=40>Cat</td>
      <td align=center width=40>M.</td>
      <td align=left>Club</td>
    </tr>
    <tr class=liste_clair>
      <td align=center>X58306</td>
      <td align=left><a href=mailto:someone@example.com class=lien_texte>MNASRI Riadh</td>
      <td align=center>A</td>
      <td align=center><a href=FicheJoueur.aspx?Id=1201846 class=lien_texte><img border=0 src=images/t_plus.gif></a></td>
      <td align=right>1522&nbsp;F</td>
      <td align=right>1280&nbsp;N</td>
      <td align=right>1199&nbsp;E</td>
      <td align=center>SenM</td>
      <td align=center>&nbsp;</td>
      <td align=left>C.E. de  Bois-Colombes</td>
	</tr>
    <tr class=liste_fonce>
      <td align=center>X57544</td>
      <td align=left>MNASRI Seji</td>
      <td align=center>A</td>
      <td align=center><a href=FicheJoueur.aspx?Id=1201092 class=lien_texte><img border=0 src=images/t_plus.gif></a></td>
      <td align=right>1738&nbsp;F</td>
      <td align=right>1795&nbsp;F</td>
      <td align=right>1710&nbsp;F</td>
      <td align=center>PupM</td>
      <td align=center>&nbsp;</td>
      <td align=left>C.E. de  Bois-Colombes</td>
	</tr>
    <tr class=liste_clair>
      <td align=center>X99999</td>
      <td align=left>MNASRI Nouveau</td>
      <td align=center>A</td>
      <td align=center><a href=FicheJoueur.aspx?Id=1300000 class=lien_texte><img border=0 src=images/t_plus.gif></a></td>
      <td align=right>&nbsp;</td>
      <td align=right>&nbsp;</td>
      <td align=right>&nbsp;</td>
      <td align=center>PouM</td>
      <td align=center>&nbsp;</td>
      <td align=left>C.E. de  Bois-Colombes</td>
	</tr>
</table>
`;

describe("parseFfePlayerSearch", () => {
  it("extracts each member row with license number, name and standard Elo", () => {
    const rows = parseFfePlayerSearch(FIXTURE_HTML);

    expect(rows).toEqual([
      { nrFfe: "X58306", name: "MNASRI Riadh", elo: 1522, eloType: "F" },
      { nrFfe: "X57544", name: "MNASRI Seji", elo: 1738, eloType: "F" },
      { nrFfe: "X99999", name: "MNASRI Nouveau", elo: null, eloType: null },
    ]);
  });

  it("returns no rows on a page without results", () => {
    expect(parseFfePlayerSearch("<html><body>rien</body></html>")).toEqual([]);
  });
});

describe("findFfePlayerRow", () => {
  it("matches a row from the app's 'Prénom Nom' spelling", () => {
    // Given the parsed rows
    const rows = parseFfePlayerSearch(FIXTURE_HTML);

    // When looking up the first-name-first form used by the app
    const row = findFfePlayerRow(rows, "Seji Mnasri");

    // Then the registry row is found despite order and case differences
    expect(row?.nrFfe).toBe("X57544");
  });

  it("returns null when nobody matches", () => {
    const rows = parseFfePlayerSearch(FIXTURE_HTML);
    expect(findFfePlayerRow(rows, "DUPONT Jean")).toBeNull();
  });
});
