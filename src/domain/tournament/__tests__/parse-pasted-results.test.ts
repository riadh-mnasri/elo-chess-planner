import { describe, expect, it } from "vitest";
import { parsePastedResults } from "../parse-pasted-results";

describe("parsePastedResults", () => {
  it("parses valid result lines in the White - Black: Result format", () => {
    // Given a block of pasted round results using common notations
    const text = `
      Riadh - Sany: 1-0
      Seji - Syma : 0-1
      Alice-Bob:1/2-1/2
    `;

    // When parsing the text
    const outcome = parsePastedResults(text);

    // Then every line is recognized with the correct result
    expect(outcome.failures).toEqual([]);
    expect(outcome.parsed).toEqual([
      { whiteName: "Riadh", blackName: "Sany", result: "white" },
      { whiteName: "Seji", blackName: "Syma", result: "black" },
      { whiteName: "Alice", blackName: "Bob", result: "draw" },
    ]);
  });

  it("flags lines that do not match the expected format or result token", () => {
    // Given a mix of a valid line and two malformed ones
    const text = `
      Riadh - Sany: 1-0
      not a valid line
      Alice - Bob: 3-0
    `;

    // When parsing the text
    const outcome = parsePastedResults(text);

    // Then only the valid line is parsed, the others are reported as failures
    expect(outcome.parsed).toHaveLength(1);
    expect(outcome.failures).toHaveLength(2);
  });
});
