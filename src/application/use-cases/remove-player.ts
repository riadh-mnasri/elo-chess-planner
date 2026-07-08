import type { PlayerRepository } from "@/application/ports/player-repository";

export class RemovePlayerUseCase {
  constructor(private readonly players: PlayerRepository) {}

  async execute(playerId: string): Promise<void> {
    await this.players.remove(playerId);
  }
}
