import type { GameResult } from "./tournament";

export interface ParsedResultLine {
  whiteName: string;
  blackName: string;
  result: GameResult;
}

export interface ParseFailure {
  line: string;
}

export interface ParsePastedResultsOutcome {
  parsed: ParsedResultLine[];
  failures: ParseFailure[];
}

const RESULT_TOKENS: Record<string, GameResult> = {
  "1-0": "white",
  "0-1": "black",
  "1/2-1/2": "draw",
  "½-½": "draw",
  "=": "draw",
};

const LINE_PATTERN = /^(.+?)\s*-\s*(.+?)\s*:\s*(.+)$/;

// Parses lines in the "White - Black: Result" format pasted after a round,
// e.g. "Riadh - Sany: 1-0". Tolerant of extra whitespace; unrecognized lines
// are reported as failures rather than throwing, so the caller can show the
// user exactly which lines need fixing.
export function parsePastedResults(text: string): ParsePastedResultsOutcome {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const parsed: ParsedResultLine[] = [];
  const failures: ParseFailure[] = [];

  for (const line of lines) {
    const match = line.match(LINE_PATTERN);
    if (!match) {
      failures.push({ line });
      continue;
    }

    const [, whiteName, blackName, resultToken] = match;
    const result = RESULT_TOKENS[resultToken.trim()];
    if (!result) {
      failures.push({ line });
      continue;
    }

    parsed.push({
      whiteName: whiteName.trim(),
      blackName: blackName.trim(),
      result,
    });
  }

  return { parsed, failures };
}
