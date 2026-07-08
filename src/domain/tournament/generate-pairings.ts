import type { Pairing, Round, TournamentParticipant } from "./tournament";
import { rankParticipants } from "./rank-participants";
import { computeStandings, type PlayerStanding } from "./compute-standings";
import { decideColors } from "./decide-colors";
import { matchAvoidingRepeats } from "./match-avoiding-repeats";

// Groups a score-ranked player pool into brackets of equal score, in
// descending score order.
function groupByScore(
  pool: string[],
  standingById: Map<string, PlayerStanding>,
): string[][] {
  const groups: string[][] = [];
  let currentScore: number | null = null;
  for (const id of pool) {
    const score = standingById.get(id)!.score;
    if (score !== currentScore) {
      groups.push([]);
      currentScore = score;
    }
    groups[groups.length - 1].push(id);
  }
  return groups;
}

function pickByeRecipient(
  pool: string[],
  standingById: Map<string, PlayerStanding>,
): string {
  for (let i = pool.length - 1; i >= 0; i--) {
    if (!standingById.get(pool[i])!.hadBye) {
      return pool[i];
    }
  }
  // Everyone already had a bye (small group, many rounds): the lowest
  // ranked player takes another one, there is no better option.
  return pool[pool.length - 1];
}

// Generates the pairings for the next round. Round 1 is not a special case:
// with no rounds played, every player has score 0, forming a single bracket
// that gets split top-half vs bottom-half - exactly the standard Dutch
// system first-round method.
export function generatePairings(
  participants: TournamentParticipant[],
  rounds: Round[],
): Pairing[] {
  const standings = computeStandings(participants, rounds);
  const standingById = new Map(standings.map((s) => [s.playerId, s]));

  const seedOrder = rankParticipants(participants).map((p) => p.playerId);
  const seedIndex = new Map(seedOrder.map((id, i) => [id, i]));

  const sortByScoreThenSeed = (a: string, b: string) => {
    const scoreDiff = standingById.get(b)!.score - standingById.get(a)!.score;
    if (scoreDiff !== 0) return scoreDiff;
    return seedIndex.get(a)! - seedIndex.get(b)!;
  };

  let pool = participants.map((p) => p.playerId).sort(sortByScoreThenSeed);

  let byePlayerId: string | null = null;
  if (pool.length % 2 === 1) {
    byePlayerId = pickByeRecipient(pool, standingById);
    pool = pool.filter((id) => id !== byePlayerId);
  }

  const groups = groupByScore(pool, standingById);
  const pairs: [string, string][] = [];
  let floatIn: string[] = [];

  for (const scoreGroup of groups) {
    const group = [...floatIn, ...scoreGroup].sort(sortByScoreThenSeed);
    floatIn = [];

    let workingGroup = group;
    if (workingGroup.length % 2 === 1) {
      floatIn = [workingGroup[workingGroup.length - 1]];
      workingGroup = workingGroup.slice(0, -1);
    }

    const half = workingGroup.length / 2;
    const top = workingGroup.slice(0, half);
    const bottom = workingGroup.slice(half);
    pairs.push(...matchAvoidingRepeats(top, bottom, standingById));
  }

  // In the rare case a lone floated player has nobody left to join (e.g. a
  // single score bracket for the whole field), pair them with the last
  // matched opponent's group is not possible - fall back to pairing the
  // remainder among themselves is not applicable for a single leftover, so
  // this player becomes the bye instead when no earlier bye was assigned.
  if (floatIn.length === 1 && byePlayerId === null) {
    byePlayerId = floatIn[0];
  }

  const pairings: Pairing[] = pairs.map(([a, b], index) => {
    const higherRanked = seedIndex.get(a)! <= seedIndex.get(b)! ? a : b;
    const lowerRanked = higherRanked === a ? b : a;
    const colors = decideColors(
      standingById.get(higherRanked)!,
      standingById.get(lowerRanked)!,
    );
    return {
      board: index + 1,
      whitePlayerId: colors.whitePlayerId,
      blackPlayerId: colors.blackPlayerId,
      result: null,
    };
  });

  if (byePlayerId !== null) {
    pairings.push({
      board: pairings.length + 1,
      whitePlayerId: byePlayerId,
      blackPlayerId: null,
      result: null,
    });
  }

  return pairings;
}
