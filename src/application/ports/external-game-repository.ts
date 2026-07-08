import type { ExternalGameImport } from "@/domain/external-import/external-game";

export interface ExternalGameRepository {
  saveMany(games: ExternalGameImport[]): Promise<void>;
  findByPlayerId(playerId: string): Promise<ExternalGameImport[]>;
}
