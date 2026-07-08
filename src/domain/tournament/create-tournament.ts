import { randomUUID } from "node:crypto";
import type { Rating } from "@/domain/player/rating";
import type { Tournament, TournamentParticipant } from "./tournament";
import { generatePairings } from "./generate-pairings";

export interface CreateTournamentParticipantInput {
  playerId: string;
  name: string;
  officialRating: Rating;
}

export interface CreateTournamentInput {
  name: string;
  date: Date;
  roundsPlanned: number;
  participants: CreateTournamentParticipantInput[];
}

export function createTournament(input: CreateTournamentInput): Tournament {
  const name = input.name.trim();
  if (name.length === 0) {
    throw new Error("Tournament name must not be blank");
  }
  if (input.roundsPlanned < 1) {
    throw new Error("A tournament must plan at least 1 round");
  }
  if (input.participants.length < 2) {
    throw new Error("A tournament needs at least 2 participants");
  }

  const participants: TournamentParticipant[] = input.participants.map((p) => ({
    playerId: p.playerId,
    name: p.name,
    seedRating: p.officialRating.value,
    seedRatingSource: p.officialRating.source,
  }));

  return {
    id: randomUUID(),
    name,
    date: input.date,
    roundsPlanned: input.roundsPlanned,
    participants,
    rounds: [{ number: 1, pairings: generatePairings(participants, []) }],
  };
}
