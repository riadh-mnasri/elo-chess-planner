import type { RatingSource } from "@/domain/player/rating";

export interface TournamentParticipant {
  playerId: string;
  name: string;
  // Rating snapshot taken when the tournament was created, used to seed
  // round 1. Frozen on purpose so a later change to Player.officialRating
  // does not silently reshuffle an already-started tournament.
  seedRating: number | null;
  seedRatingSource: RatingSource;
}

export type GameResult = "white" | "black" | "draw";

export interface Pairing {
  board: number;
  whitePlayerId: string;
  // null means the black player has a bye on this board.
  blackPlayerId: string | null;
  result: GameResult | null;
}

export interface Round {
  number: number;
  pairings: Pairing[];
}

export interface Tournament {
  id: string;
  name: string;
  date: Date;
  roundsPlanned: number;
  participants: TournamentParticipant[];
  rounds: Round[];
}
