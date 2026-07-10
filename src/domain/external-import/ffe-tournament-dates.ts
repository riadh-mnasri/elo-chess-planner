const FRENCH_MONTHS: Record<string, number> = {
  janvier: 0,
  février: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  août: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  décembre: 11,
};

export interface FfeDateRange {
  start: Date;
  end: Date;
}

function parseFrenchDate(text: string): Date | null {
  const match = text
    .trim()
    .toLowerCase()
    .match(/(\d{1,2})\s+([a-zàâéèêëîïôûù]+)\s+(\d{4})/);
  if (!match) return null;

  const [, day, monthName, year] = match;
  const month = FRENCH_MONTHS[monthName];
  if (month === undefined) return null;

  // Built as UTC midnight, not local midnight: this value is stored and
  // later rendered via toISOString().slice(0, 10) elsewhere in the app,
  // which would otherwise shift the calendar day in any timezone ahead of
  // UTC (e.g. France, the app's own timezone).
  return new Date(Date.UTC(Number(year), month, Number(day)));
}

// Parses the FFE tournament fiche's "Dates :" field, e.g. "samedi 04
// juillet 2026 - vendredi 10 juillet 2026" (day names are ignored). A
// single-day tournament has no " - " separator, in which case start and
// end are the same date.
export function parseFfeDateRange(ficheHtml: string): FfeDateRange | null {
  const labelMatch = ficheHtml.match(
    /LabelDates["'][^>]*>([^<]+)</,
  );
  if (!labelMatch) return null;

  const [startText, endText] = labelMatch[1].split(" - ");
  const start = parseFrenchDate(startText);
  const end = endText ? parseFrenchDate(endText) : start;
  if (!start || !end) return null;

  return { start, end };
}

// Spreads a set of round numbers evenly across a tournament's date range,
// since FFE result pages don't publish a date per round. Rounds are
// assumed to occur in order, spaced evenly between the first and last day.
export function spreadDatesAcrossRounds(range: FfeDateRange, roundNumbers: number[]): Date[] {
  if (roundNumbers.length === 0) return [];

  const maxRound = Math.max(...roundNumbers);
  const spanMs = range.end.getTime() - range.start.getTime();

  return roundNumbers.map((round) => {
    if (maxRound <= 1) return new Date(range.start);
    const fraction = (round - 1) / (maxRound - 1);
    const dayMs = Math.round((spanMs * fraction) / DAY_MS) * DAY_MS;
    return new Date(range.start.getTime() + dayMs);
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;
