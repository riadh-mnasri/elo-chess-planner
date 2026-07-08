import type { Player } from "@/domain/player/player";

export interface PlayerRepository {
  save(player: Player): Promise<void>;
  findById(id: string): Promise<Player | null>;
  findAll(): Promise<Player[]>;
  remove(id: string): Promise<void>;
}
