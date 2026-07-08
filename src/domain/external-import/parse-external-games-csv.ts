import type { ExternalGameSource, GameOutcome } from "./external-game";

export interface ParsedExternalGameRow {
  date: Date;
  opponent: string;
  result: GameOutcome;
  eloBefore: number | null;
  eloAfter: number;
  source: ExternalGameSource;
}

export interface ParseExternalGamesCsvOutcome {
  rows: ParsedExternalGameRow[];
  errors: string[];
}

const VALID_SOURCES = new Set<string>(["fide", "ffe", "chesscom", "lichess"]);
const VALID_RESULTS = new Set<string>(["win", "loss", "draw"]);
const EXPECTED_HEADER = ["date", "opponent", "result", "elobefore", "eloafter", "source"];

// Parses the CSV format documented in the plan: one row per game, columns
// date,opponent,result,eloBefore,eloAfter,source. A header line is optional
// and auto-detected; malformed rows are reported rather than throwing, so
// the caller can show the user exactly which lines to fix.
export function parseExternalGamesCsv(text: string): ParseExternalGamesCsvOutcome {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: [] };
  }

  const firstLineColumns = lines[0].split(",").map((c) => c.trim().toLowerCase());
  const hasHeader = EXPECTED_HEADER.every((c) => firstLineColumns.includes(c));
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const rows: ParsedExternalGameRow[] = [];
  const errors: string[] = [];

  for (const line of dataLines) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length !== 6) {
      errors.push(`Expected 6 columns: "${line}"`);
      continue;
    }

    const [dateStr, opponent, resultStr, eloBeforeStr, eloAfterStr, sourceStr] = parts;
    const date = new Date(dateStr);
    const result = resultStr.toLowerCase();
    const source = sourceStr.toLowerCase();
    const eloAfter = Number(eloAfterStr);
    const eloBefore = eloBeforeStr === "" ? null : Number(eloBeforeStr);

    if (Number.isNaN(date.getTime())) {
      errors.push(`Invalid date: "${line}"`);
      continue;
    }
    if (!opponent) {
      errors.push(`Missing opponent: "${line}"`);
      continue;
    }
    if (!VALID_RESULTS.has(result)) {
      errors.push(`Invalid result (expected win/loss/draw): "${line}"`);
      continue;
    }
    if (!VALID_SOURCES.has(source)) {
      errors.push(`Invalid source (expected fide/ffe/chesscom/lichess): "${line}"`);
      continue;
    }
    if (Number.isNaN(eloAfter) || (eloBefore !== null && Number.isNaN(eloBefore))) {
      errors.push(`Invalid rating value: "${line}"`);
      continue;
    }

    rows.push({
      date,
      opponent,
      result: result as GameOutcome,
      eloBefore,
      eloAfter,
      source: source as ExternalGameSource,
    });
  }

  return { rows, errors };
}
