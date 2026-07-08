export type ExternalGameSource = "fide" | "ffe" | "chesscom" | "lichess";
export type GameOutcome = "win" | "loss" | "draw";

export interface ExternalGameImport {
  id: string;
  playerId: string;
  source: ExternalGameSource;
  date: Date;
  opponent: string;
  result: GameOutcome;
  // Not always known (e.g. a player's very first imported game), whereas
  // the rating right after the game is always available.
  eloBefore: number | null;
  eloAfter: number;
  importBatchId: string;
}
