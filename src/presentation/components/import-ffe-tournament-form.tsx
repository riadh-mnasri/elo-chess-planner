"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  importFfeTournamentAction,
  type ImportGamesFormState,
} from "@/app/[locale]/players/[id]/import/actions";
import { Button } from "@/presentation/components/ui/button";
import { inputClasses } from "@/presentation/components/ui/input";

const initialState: ImportGamesFormState = { error: null, importedCount: null };

export function ImportFfeTournamentForm({
  playerId,
  defaultPlayerName,
}: {
  playerId: string;
  defaultPlayerName: string;
}) {
  const t = useTranslations("ImportPage");
  const [state, formAction, isPending] = useActionState(importFfeTournamentAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="playerId" value={playerId} />
      <h3 className="text-sm font-medium">{t("ffeHeading")}</h3>
      <p className="text-xs text-muted">{t("ffeHelp")}</p>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("ffeUrlLabel")}
        <input
          name="tournamentUrl"
          type="url"
          required
          placeholder="https://www.echecs.asso.fr/FicheTournoi.aspx?Ref=..."
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("ffePlayerNameLabel")}
        <input
          name="playerName"
          required
          defaultValue={defaultPlayerName}
          className={inputClasses}
        />
      </label>

      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.importedCount !== null ? (
        <p className="text-sm text-accent">
          {t("importSuccess", { count: state.importedCount })}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={isPending} className="self-start">
        {t("ffeImportButton")}
      </Button>
    </form>
  );
}
