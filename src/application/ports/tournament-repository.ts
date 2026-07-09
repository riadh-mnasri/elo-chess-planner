import type { Tournament } from "@/domain/tournament/tournament";

export interface TournamentRepository {
  save(tournament: Tournament): Promise<void>;
  findById(id: string): Promise<Tournament | null>;
  findAll(): Promise<Tournament[]>;
  remove(id: string): Promise<void>;
}
