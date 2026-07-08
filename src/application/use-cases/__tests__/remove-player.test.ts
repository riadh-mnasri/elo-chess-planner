import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { PlayerRepository } from "@/application/ports/player-repository";
import { RemovePlayerUseCase } from "../remove-player";

describe("RemovePlayerUseCase", () => {
  it("removes the player with the given id from the repository", async () => {
    // Given a repository mock
    const repository = mock<PlayerRepository>();
    const useCase = new RemovePlayerUseCase(repository);

    // When removing a player by id
    await useCase.execute("p1");

    // Then the repository is asked to remove that player
    expect(repository.remove).toHaveBeenCalledWith("p1");
  });
});
