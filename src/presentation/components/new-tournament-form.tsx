"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { Player } from "@/domain/player/player";
import {
  createTournamentAction,
  type CreateTournamentFormState,
} from "@/app/[locale]/tournaments/actions";
import { Card } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { inputClasses, labelClasses } from "@/presentation/components/ui/input";

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
    <Card>
      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="locale" value={locale} />

        <label className={labelClasses}>
          {t("nameLabel")}
          <input name="name" required className={inputClasses} />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClasses}>
            {t("dateLabel")}
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={inputClasses}
            />
          </label>

          <label className={labelClasses}>
            {t("roundsPlannedLabel")}
            <input
              type="number"
              name="roundsPlanned"
              min={1}
              defaultValue={3}
              required
              className={inputClasses}
            />
          </label>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={labelClasses}>{t("participantsLabel")}</legend>
          <p className="text-xs text-muted">{t("participantsHelp")}</p>

          {players.length === 0 ? (
            <p className="text-sm text-gold">{t("noPlayersWarning")}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm has-checked:border-accent has-checked:bg-accent/5"
                >
                  <input
                    type="checkbox"
                    name="playerIds"
                    value={player.id}
                    id={player.id}
                    className="accent-accent"
                  />
                  <label htmlFor={player.id} className="flex-1 cursor-pointer">
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
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isPending || players.length < 2}
          className="self-start"
        >
          {t("submitButton")}
        </Button>
      </form>
    </Card>
  );
}
