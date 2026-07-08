import type { PlayerStanding } from "./compute-standings";

// Finds the assignment of `bottom` players to `top` players (same length,
// paired by index) that minimizes the number of repeated opponents. With the
// small group sizes this app targets, an exhaustive search over all
// permutations is cheap and guarantees the best possible outcome, including
// falling back to a repeat pairing when no repeat-free assignment exists.
export function matchAvoidingRepeats(
  top: string[],
  bottom: string[],
  standingById: Map<string, PlayerStanding>,
): [string, string][] {
  const n = top.length;
  if (n === 0) return [];

  let bestAssignment: number[] = bottom.map((_, i) => i);
  let bestRepeats = countRepeats(top, bottom, bestAssignment, standingById);

  const indices = bottom.map((_, i) => i);
  permute(indices, 0, (candidate) => {
    const repeats = countRepeats(top, bottom, candidate, standingById);
    if (repeats < bestRepeats) {
      bestRepeats = repeats;
      bestAssignment = [...candidate];
    }
  });

  return top.map((a, i) => [a, bottom[bestAssignment[i]]] as [string, string]);
}

function countRepeats(
  top: string[],
  bottom: string[],
  assignment: number[],
  standingById: Map<string, PlayerStanding>,
): number {
  let repeats = 0;
  for (let i = 0; i < top.length; i++) {
    const a = top[i];
    const b = bottom[assignment[i]];
    if (standingById.get(a)?.opponentIds.includes(b)) {
      repeats += 1;
    }
  }
  return repeats;
}

function permute(
  arr: number[],
  k: number,
  onPermutation: (arr: number[]) => void,
): void {
  if (k === arr.length) {
    onPermutation(arr);
    return;
  }
  for (let i = k; i < arr.length; i++) {
    [arr[k], arr[i]] = [arr[i], arr[k]];
    permute(arr, k + 1, onPermutation);
    [arr[k], arr[i]] = [arr[i], arr[k]];
  }
}
