import type { Pairing, Round, TournamentParticipant } from "./tournament";
import type { ParsedResultLine } from "./parse-pasted-results";

export interface ApplyParsedResultsOutcome {
  round?: Round;
  errors: string[];
}

// Matches parsed "White - Black: Result" lines to the round's pairings by
// player name (case-insensitive). Bye pairings need no match since they are
// already complete. Fails closed: if any real pairing has no matching line,
// nothing is updated and the missing pairings are reported.
export function applyParsedResultsToRound(
  round: Round,
  parsed: ParsedResultLine[],
  participants: TournamentParticipant[],
): ApplyParsedResultsOutcome {
  const nameById = new Map(
    participants.map((p) => [p.playerId, p.name] as const),
  );

  const errors: string[] = [];
  const updatedPairings: Pairing[] = [];

  for (const pairing of round.pairings) {
    if (pairing.blackPlayerId === null) {
      updatedPairings.push(pairing);
      continue;
    }

    const whiteName = nameById.get(pairing.whitePlayerId) ?? pairing.whitePlayerId;
    const blackName = nameById.get(pairing.blackPlayerId) ?? pairing.blackPlayerId;

    const match = parsed.find(
      (line) =>
        line.whiteName.toLowerCase() === whiteName.toLowerCase() &&
        line.blackName.toLowerCase() === blackName.toLowerCase(),
    );

    if (!match) {
      errors.push(`No result found for ${whiteName} - ${blackName}`);
      continue;
    }

    updatedPairings.push({ ...pairing, result: match.result });
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { round: { ...round, pairings: updatedPairings }, errors: [] };
}
