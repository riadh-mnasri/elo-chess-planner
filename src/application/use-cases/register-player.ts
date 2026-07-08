import { createPlayer } from "@/domain/player/create-player";
import type { CreatePlayerInput } from "@/domain/player/create-player";
import type { Player } from "@/domain/player/player";
import type { PlayerRepository } from "@/application/ports/player-repository";

export class RegisterPlayerUseCase {
  constructor(private readonly players: PlayerRepository) {}

  async execute(input: CreatePlayerInput): Promise<Player> {
    const player = createPlayer(input);
    await this.players.save(player);
    return player;
  }
}
