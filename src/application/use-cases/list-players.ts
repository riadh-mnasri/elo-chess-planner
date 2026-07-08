import type { Player } from "@/domain/player/player";
import type { PlayerRepository } from "@/application/ports/player-repository";

export class ListPlayersUseCase {
  constructor(private readonly players: PlayerRepository) {}

  async execute(): Promise<Player[]> {
    return this.players.findAll();
  }
}
