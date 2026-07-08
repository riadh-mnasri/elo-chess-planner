"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { Round, TournamentParticipant } from "@/domain/tournament/tournament";
import {
  submitRoundResultsAction,
  type SubmitResultsFormState,
} from "@/app/[locale]/tournaments/actions";
import { Button } from "@/presentation/components/ui/button";
import { Badge } from "@/presentation/components/ui/badge";
import { inputClasses } from "@/presentation/components/ui/input";

const initialState: SubmitResultsFormState = { error: null };

export function RoundResultsForm({
  tournamentId,
  round,
  participants,
}: {
  tournamentId: string;
  round: Round;
  participants: TournamentParticipant[];
}) {
  const t = useTranslations("TournamentDetailPage");
  const [state, formAction, isPending] = useActionState(
    submitRoundResultsAction,
    initialState,
  );
  const nameById = new Map(participants.map((p) => [p.playerId, p.name]));

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="roundNumber" value={round.number} />

      <div className="flex flex-col gap-2">
        {round.pairings.map((pairing) => (
          <div
            key={pairing.board}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm"
          >
            <Badge tone="neutral" className="shrink-0">
              {t("boardLabel")} {pairing.board}
            </Badge>
            <span className="flex-1 font-medium">
              {nameById.get(pairing.whitePlayerId) ?? pairing.whitePlayerId}
              {pairing.blackPlayerId ? (
                <>
                  {" "}
                  <span className="font-normal text-muted">vs</span>{" "}
                  {nameById.get(pairing.blackPlayerId) ?? pairing.blackPlayerId}
                </>
              ) : null}
            </span>

            {pairing.blackPlayerId ? (
              <select
                name={`result-${pairing.board}`}
                defaultValue={pairing.result ?? ""}
                className={`${inputClasses} py-1.5`}
              >
                <option value="">{t("resultPending")}</option>
                <option value="white">{t("resultWhiteWins")}</option>
                <option value="draw">{t("resultDraw")}</option>
                <option value="black">{t("resultBlackWins")}</option>
              </select>
            ) : (
              <Badge tone="gold">{t("byeLabel")}</Badge>
            )}
          </div>
        ))}
      </div>

      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {t("submitResultsButton")}
      </Button>
    </form>
  );
}
