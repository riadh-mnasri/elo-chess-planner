import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { PlayerRepository } from "@/application/ports/player-repository";
import { RegisterPlayerUseCase } from "../register-player";

describe("RegisterPlayerUseCase", () => {
  it("saves a newly created family player to the repository", async () => {
    // Given a repository mock and a family player registration request
    const repository = mock<PlayerRepository>();
    const useCase = new RegisterPlayerUseCase(repository);

    // When registering the player
    const player = await useCase.execute({
      name: "Sany",
      type: "family",
      ratings: { chesscom: 900 },
    });

    // Then the player is persisted with the resolved rating and returned
    expect(repository.save).toHaveBeenCalledWith(player);
    expect(player.officialRating).toEqual({ value: 900, source: "chesscom" });
    expect(player.type).toBe("family");
  });

  it("propagates domain validation errors without saving", async () => {
    // Given a repository mock and a blank player name
    const repository = mock<PlayerRepository>();
    const useCase = new RegisterPlayerUseCase(repository);

    // When registering a player with a blank name
    // Then the use case rejects and nothing is saved
    await expect(
      useCase.execute({ name: " ", type: "guest", ratings: {} }),
    ).rejects.toThrow(/name/i);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
