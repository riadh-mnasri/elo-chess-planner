import type { FetchedExternalGame } from "@/application/ports/external-rating-provider";

export interface FfeTournamentProvider {
  fetchTournamentGames(
    tournamentUrl: string,
    playerName: string,
    age: number | null,
  ): Promise<FetchedExternalGame[]>;
}
