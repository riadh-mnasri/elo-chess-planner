import { randomUUID } from "node:crypto";
import type { Player, PlayerType, ExternalIds } from "./player";
import { resolveOfficialRating } from "./resolve-official-rating";
import type { RatingCandidates } from "./rating";

export interface CreatePlayerInput {
  name: string;
  type: PlayerType;
  birthDate?: Date;
  ratings: RatingCandidates;
  externalIds?: ExternalIds;
}

export function createPlayer(input: CreatePlayerInput): Player {
  const name = input.name.trim();
  if (name.length === 0) {
    throw new Error("Player name must not be blank");
  }

  return {
    id: randomUUID(),
    name,
    type: input.type,
    birthDate: input.birthDate ?? null,
    officialRating: resolveOfficialRating(input.ratings),
    homeElo: null,
    externalIds: input.externalIds ?? {},
  };
}
