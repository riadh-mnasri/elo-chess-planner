import { normalizeFfeName } from "./ffe-name";

// One row of the FFE member search results (ListeJoueurs.aspx?Action=FFE).
// The standard Elo is printed with a letter qualifying its origin:
// F = FIDE-published, N = national (FFE-only games), E = estimated.
export interface FfePlayerSearchRow {
  nrFfe: string;
  name: string;
  elo: number | null;
  eloType: "F" | "N" | "E" | null;
}

const ROW_REGEX = /<tr class=liste_(?:clair|fonce)>([\s\S]*?)<\/tr>/g;
const CELL_REGEX = /<td[^>]*>([\s\S]*?)<\/td>/g;

function decodeText(raw: string): string {
  return raw
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function extractCells(rowHtml: string): string[] {
  const cells: string[] = [];
  const regex = new RegExp(CELL_REGEX);
  let match: RegExpExecArray | null;
  while ((match = regex.exec(rowHtml)) !== null) {
    cells.push(match[1]);
  }
  return cells;
}

function parseEloCell(raw: string): Pick<FfePlayerSearchRow, "elo" | "eloType"> {
  const match = decodeText(raw).match(/(\d+)\s*([FNE])?/);
  if (!match) return { elo: null, eloType: null };
  return {
    elo: Number(match[1]),
    eloType: (match[2] as FfePlayerSearchRow["eloType"]) ?? null,
  };
}

// Parses the member rows out of an FFE registry search results page.
// Cells: NrFFE, name, affiliation, fiche link, standard Elo, rapid, blitz...
export function parseFfePlayerSearch(html: string): FfePlayerSearchRow[] {
  const rows: FfePlayerSearchRow[] = [];
  const regex = new RegExp(ROW_REGEX);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const cells = extractCells(match[1]);
    if (cells.length < 5) continue;

    const nrFfe = decodeText(cells[0]);
    const name = decodeText(cells[1]);
    if (!nrFfe || !name) continue;

    rows.push({ nrFfe, name, ...parseEloCell(cells[4]) });
  }

  return rows;
}

export function findFfePlayerRow(
  rows: FfePlayerSearchRow[],
  playerName: string,
): FfePlayerSearchRow | null {
  const target = normalizeFfeName(playerName);
  return rows.find((row) => normalizeFfeName(row.name) === target) ?? null;
}
