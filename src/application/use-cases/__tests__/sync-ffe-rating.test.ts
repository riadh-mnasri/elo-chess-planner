import { describe, expect, it } from "vitest";
import { SyncFfeRatingUseCase } from "../sync-ffe-rating";
import { InMemoryPlayerRepository } from "@/infrastructure/repositories/in-memory-player-repository";
import { createPlayer } from "@/domain/player/create-player";
import type { FfePlayerRatingProvider } from "@/application/ports/ffe-player-rating-provider";

describe("SyncFfeRatingUseCase", () => {
  it("updates the player's official rating and FFE license number from the registry", async () => {
    // Given a player registered with a stale manual FFE rating
    const players = new InMemoryPlayerRepository();
    const player = createPlayer({
      name: "Seji MNASRI",
      type: "family",
      ratings: { ffe: 1650 },
    });
    await players.save(player);

    const provider: FfePlayerRatingProvider = {
      fetchPlayerRating: async () => ({
        nrFfe: "X57544",
        printedName: "MNASRI Seji",
        elo: 1738,
        source: "fide",
      }),
    };

    // When syncing from the FFE registry
    const outcome = await new SyncFfeRatingUseCase(players, provider).execute(player.id);

    // Then the outcome and the stored player reflect the fetched rating
    expect(outcome).toEqual({ rating: 1738, source: "fide", nrFfe: "X57544" });
    const updated = await players.findById(player.id);
    expect(updated?.officialRating).toEqual({ value: 1738, source: "fide" });
    expect(updated?.externalIds.ffe).toBe("X57544");
  });

  it("rejects for an unknown player id", async () => {
    const players = new InMemoryPlayerRepository();
    const provider: FfePlayerRatingProvider = {
      fetchPlayerRating: async () => {
        throw new Error("should not be called");
      },
    };

    await expect(
      new SyncFfeRatingUseCase(players, provider).execute("missing"),
    ).rejects.toThrow(/Player not found/);
  });
});
