import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { TournamentRepository } from "@/application/ports/tournament-repository";
import { RemoveTournamentUseCase } from "../remove-tournament";

describe("RemoveTournamentUseCase", () => {
  it("removes the tournament with the given id from the repository", async () => {
    // Given a repository mock
    const repository = mock<TournamentRepository>();
    const useCase = new RemoveTournamentUseCase(repository);

    // When removing a tournament by id
    await useCase.execute("t1");

    // Then the repository is asked to remove that tournament
    expect(repository.remove).toHaveBeenCalledWith("t1");
  });
});
