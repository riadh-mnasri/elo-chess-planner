"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { Round, TournamentParticipant } from "@/domain/tournament/tournament";
import {
  submitRoundResultsAction,
  type SubmitResultsFormState,
} from "@/app/[locale]/tournaments/actions";

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

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-foreground/60">
            <th className="py-1 font-normal">{t("boardLabel")}</th>
            <th className="font-normal">{t("whiteLabel")}</th>
            <th className="font-normal">{t("blackLabel")}</th>
            <th className="font-normal" />
          </tr>
        </thead>
        <tbody>
          {round.pairings.map((pairing) => (
            <tr key={pairing.board} className="border-t border-foreground/10">
              <td className="py-2">{pairing.board}</td>
              <td>{nameById.get(pairing.whitePlayerId) ?? pairing.whitePlayerId}</td>
              <td>
                {pairing.blackPlayerId
                  ? nameById.get(pairing.blackPlayerId) ?? pairing.blackPlayerId
                  : t("byeLabel")}
              </td>
              <td>
                {pairing.blackPlayerId ? (
                  <select
                    name={`result-${pairing.board}`}
                    defaultValue={pairing.result ?? ""}
                    className="rounded border border-foreground/20 bg-transparent px-1 py-0.5"
                  >
                    <option value="">{t("resultPending")}</option>
                    <option value="white">{t("resultWhiteWins")}</option>
                    <option value="draw">{t("resultDraw")}</option>
                    <option value="black">{t("resultBlackWins")}</option>
                  </select>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {t("submitResultsButton")}
      </button>
    </form>
  );
}
