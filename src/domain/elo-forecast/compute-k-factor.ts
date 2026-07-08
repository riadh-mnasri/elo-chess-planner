export interface ComputeKFactorInput {
  age: number | null;
  rating: number;
}

// Simplified FIDE K-factor rule: juniors under 18 rated below 2300 change
// rating fastest (K=40), players who ever reached 2400 change slowest
// (K=10), everyone else uses the standard K=20.
export function computeKFactor(input: ComputeKFactorInput): number {
  if (input.age !== null && input.age < 18 && input.rating < 2300) {
    return 40;
  }
  if (input.rating >= 2400) {
    return 10;
  }
  return 20;
}
