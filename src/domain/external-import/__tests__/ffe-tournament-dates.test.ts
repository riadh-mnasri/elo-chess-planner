import { describe, expect, it } from "vitest";
import { parseFfeDateRange, spreadDatesAcrossRounds } from "../ffe-tournament-dates";

describe("parseFfeDateRange", () => {
  it("parses a multi-day French date range from the tournament fiche markup", () => {
    // Given a fiche page excerpt with a date range
    const html =
      '<span id="ctl00_ContentPlaceHolderMain_LabelDates">samedi 04 juillet 2026 - vendredi 10 juillet 2026</span>';

    // When parsing the date range
    const range = parseFfeDateRange(html);

    // Then both boundaries are extracted correctly, as UTC midnight
    expect(range).not.toBeNull();
    expect(range!.start).toEqual(new Date(Date.UTC(2026, 6, 4)));
    expect(range!.end).toEqual(new Date(Date.UTC(2026, 6, 10)));
  });

  it("treats a single-day tournament as start equal to end", () => {
    // Given a fiche page excerpt with only one date
    const html =
      '<span id="ctl00_ContentPlaceHolderMain_LabelDates">dimanche 12 avril 2026</span>';

    // When parsing the date range
    const range = parseFfeDateRange(html);

    // Then start and end are the same day
    expect(range).not.toBeNull();
    expect(range!.start).toEqual(new Date(Date.UTC(2026, 3, 12)));
    expect(range!.end).toEqual(new Date(Date.UTC(2026, 3, 12)));
  });

  it("returns null when the dates label is missing", () => {
    // Given a page without the dates label
    // When parsing
    const range = parseFfeDateRange("<html></html>");

    // Then nothing is returned
    expect(range).toBeNull();
  });
});

describe("spreadDatesAcrossRounds", () => {
  it("spreads round numbers evenly across a multi-day range", () => {
    // Given a 6-day span for a 9-round tournament
    const range = { start: new Date(2026, 6, 4), end: new Date(2026, 6, 10) };

    // When spreading all 9 rounds
    const dates = spreadDatesAcrossRounds(range, [1, 5, 9]);

    // Then round 1 lands on the start, round 9 on the end, round 5 midway
    expect(dates[0]).toEqual(new Date(2026, 6, 4));
    expect(dates[1]).toEqual(new Date(2026, 6, 7));
    expect(dates[2]).toEqual(new Date(2026, 6, 10));
  });

  it("assigns the start date to every round of a single-day tournament", () => {
    // Given a same-day range
    const range = { start: new Date(2026, 3, 12), end: new Date(2026, 3, 12) };

    // When spreading two rounds
    const dates = spreadDatesAcrossRounds(range, [1, 2]);

    // Then both rounds fall on that day
    expect(dates).toEqual([new Date(2026, 3, 12), new Date(2026, 3, 12)]);
  });
});
