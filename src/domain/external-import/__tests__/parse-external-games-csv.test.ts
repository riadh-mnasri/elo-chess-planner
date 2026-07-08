import { describe, expect, it } from "vitest";
import { parseExternalGamesCsv } from "../parse-external-games-csv";

describe("parseExternalGamesCsv", () => {
  it("parses rows with a header line, skipping the header", () => {
    // Given a CSV with a header row and two data rows
    const csv = [
      "date,opponent,result,eloBefore,eloAfter,source",
      "2026-06-01,Jean Dupont,win,1450,1458,ffe",
      "2026-06-08,Marie Petit,loss,1458,1450,chesscom",
    ].join("\n");

    // When parsing the CSV
    const outcome = parseExternalGamesCsv(csv);

    // Then both rows are parsed with no errors
    expect(outcome.errors).toEqual([]);
    expect(outcome.rows).toEqual([
      {
        date: new Date("2026-06-01"),
        opponent: "Jean Dupont",
        result: "win",
        eloBefore: 1450,
        eloAfter: 1458,
        source: "ffe",
      },
      {
        date: new Date("2026-06-08"),
        opponent: "Marie Petit",
        result: "loss",
        eloBefore: 1458,
        eloAfter: 1450,
        source: "chesscom",
      },
    ]);
  });

  it("parses rows without a header line", () => {
    // Given a CSV with no header, just one data row
    const csv = "2026-06-01,Jean Dupont,draw,1450,1454,fide";

    // When parsing the CSV
    const outcome = parseExternalGamesCsv(csv);

    // Then the row is parsed correctly
    expect(outcome.errors).toEqual([]);
    expect(outcome.rows).toHaveLength(1);
    expect(outcome.rows[0].opponent).toBe("Jean Dupont");
  });

  it("allows an empty eloBefore for a player's first known game", () => {
    // Given a row with no eloBefore value
    const csv = "2026-06-01,Jean Dupont,win,,1458,ffe";

    // When parsing the CSV
    const outcome = parseExternalGamesCsv(csv);

    // Then eloBefore is null and the rest is parsed
    expect(outcome.errors).toEqual([]);
    expect(outcome.rows[0].eloBefore).toBeNull();
  });

  it("reports errors for malformed rows without throwing", () => {
    // Given one valid row and rows with bad result/source/column-count
    const csv = [
      "date,opponent,result,eloBefore,eloAfter,source",
      "2026-06-01,Jean Dupont,win,1450,1458,ffe",
      "2026-06-08,Marie Petit,not-a-result,1458,1450,chesscom",
      "2026-06-09,Paul,win,1450,1458,not-a-source",
      "missing,columns",
    ].join("\n");

    // When parsing the CSV
    const outcome = parseExternalGamesCsv(csv);

    // Then only the valid row is parsed and the rest are reported as errors
    expect(outcome.rows).toHaveLength(1);
    expect(outcome.errors).toHaveLength(3);
  });
});
