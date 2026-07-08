"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { Player } from "@/domain/player/player";
import {
  createTournamentAction,
  type CreateTournamentFormState,
} from "@/app/[locale]/tournaments/actions";

const initialState: CreateTournamentFormState = { error: null };

export function NewTournamentForm({
  players,
  locale,
}: {
  players: Player[];
  locale: string;
}) {
  const t = useTranslations("NewTournamentPage");
  const [state, formAction, isPending] = useActionState(
    createTournamentAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <label className="flex flex-col gap-1 text-sm">
        {t("nameLabel")}
        <input
          name="name"
          required
          className="rounded border border-foreground/20 bg-transparent px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        {t("dateLabel")}
        <input
          type="date"
          name="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="rounded border border-foreground/20 bg-transparent px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        {t("roundsPlannedLabel")}
        <input
          type="number"
          name="roundsPlanned"
          min={1}
          defaultValue={3}
          required
          className="w-24 rounded border border-foreground/20 bg-transparent px-2 py-1"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm">{t("participantsLabel")}</legend>
        <p className="text-xs text-foreground/60">{t("participantsHelp")}</p>

        {players.length === 0 ? (
          <p className="text-sm text-amber-600">{t("noPlayersWarning")}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {players.map((player) => (
              <li key={player.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="playerIds" value={player.id} id={player.id} />
                <label htmlFor={player.id}>
                  {player.name}
                  {player.officialRating.value !== null
                    ? ` (${player.officialRating.value} ${player.officialRating.source.toUpperCase()})`
                    : ""}
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || players.length < 2}
        className="mt-2 self-start rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {t("submitButton")}
      </button>
    </form>
  );
}
