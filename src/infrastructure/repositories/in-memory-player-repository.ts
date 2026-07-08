import type { Player } from "@/domain/player/player";
import type { PlayerRepository } from "@/application/ports/player-repository";

export class InMemoryPlayerRepository implements PlayerRepository {
  private readonly players = new Map<string, Player>();

  async save(player: Player): Promise<void> {
    this.players.set(player.id, player);
  }

  async findById(id: string): Promise<Player | null> {
    return this.players.get(id) ?? null;
  }

  async findAll(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async remove(id: string): Promise<void> {
    this.players.delete(id);
  }
}
