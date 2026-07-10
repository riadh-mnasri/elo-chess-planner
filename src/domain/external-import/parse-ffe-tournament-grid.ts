import type { GameOutcome } from "./external-game";

export interface FfeRoundGame {
  round: number;
  color: "white" | "black";
  result: GameOutcome;
  opponentName: string;
  opponentRating: number | null;
}

export interface FfeTournamentPlayerRecord {
  playerRating: number | null;
  games: FfeRoundGame[];
}

// Matches the FFE "grille américaine" (Action=Ga) markup, one
// papi_joueur_box block per player. Each block starts with the player's own
// summary row, followed by one row per round: round number, color (B for
// Blancs/white, N for Noirs/black), result (1/0/&frac12;), opponent rank,
// opponent name and opponent rating.
const PLAYER_BLOCK_REGEX =
  /<div class=papi_joueur_box>\s*<b>([^<]*)<\/b>([\s\S]*?)<\/table>\s*<\/div>\s*<\/div>/g;
const ROW_REGEX = /<tr class=papi_small_[a-z]>([\s\S]*?)<\/tr>/g;
const CELL_REGEX = /<td[^>]*>([\s\S]*?)<\/td>/g;

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toUpperCase();
}

function decodeText(raw: string): string {
  return raw
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function extractRows(blockHtml: string): string[] {
  const rows: string[] = [];
  const regex = new RegExp(ROW_REGEX);
  let match: RegExpExecArray | null;
  while ((match = regex.exec(blockHtml)) !== null) {
    rows.push(match[1]);
  }
  return rows;
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

function parseResult(raw: string): GameOutcome | null {
  if (raw.includes("frac12")) return "draw";
  const text = decodeText(raw);
  if (text === "1") return "win";
  if (text === "0") return "loss";
  return null;
}

function parseRatingCell(raw: string): number | null {
  const match = decodeText(raw).match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

// Parses one player's full round-by-round record out of an FFE tournament
// results grid page. FFE doesn't expose license numbers in this view, so
// players are matched by their exact printed name ("NOM Prénom").
export function parseFfeTournamentGrid(
  html: string,
  playerName: string,
): FfeTournamentPlayerRecord | null {
  const target = normalizeName(playerName);
  const regex = new RegExp(PLAYER_BLOCK_REGEX);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const [, blockName, blockBody] = match;
    if (normalizeName(blockName) !== target) continue;

    const rows = extractRows(blockBody);
    if (rows.length === 0) return null;

    const [selfRow, ...roundRows] = rows;
    const selfCells = extractCells(selfRow);
    const playerRating = selfCells.length > 4 ? parseRatingCell(selfCells[4]) : null;

    const games: FfeRoundGame[] = [];
    for (const rowHtml of roundRows) {
      const cells = extractCells(rowHtml);
      if (cells.length < 7) continue;

      const round = Number(decodeText(cells[0]));
      const color = decodeText(cells[1]);
      const result = parseResult(cells[2]);
      const opponentName = decodeText(cells[5]);
      const opponentRating = parseRatingCell(cells[6]);

      if (!Number.isInteger(round) || result === null || !opponentName) continue;
      if (color !== "B" && color !== "N") continue;

      games.push({
        round,
        color: color === "B" ? "white" : "black",
        result,
        opponentName,
        opponentRating,
      });
    }

    return { playerRating, games };
  }

  return null;
}
