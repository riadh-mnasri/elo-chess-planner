"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  registerPlayerAction,
  type RegisterPlayerFormState,
} from "@/app/[locale]/players/actions";

const initialState: RegisterPlayerFormState = { error: null };

export function PlayerForm() {
  const t = useTranslations("PlayersPage");
  const [state, formAction, isPending] = useActionState(
    registerPlayerAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-4"
    >
      <h2 className="text-lg font-medium">{t("addPlayerHeading")}</h2>

      <label className="flex flex-col gap-1 text-sm">
        {t("nameLabel")}
        <input
          name="name"
          required
          className="rounded border border-foreground/20 bg-transparent px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        {t("typeLabel")}
        <select
          name="type"
          defaultValue="family"
          className="rounded border border-foreground/20 bg-transparent px-2 py-1"
        >
          <option value="family">{t("typeFamily")}</option>
          <option value="guest">{t("typeGuest")}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        {t("birthDateLabel")}
        <input
          type="date"
          name="birthDate"
          className="rounded border border-foreground/20 bg-transparent px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        {t("fideRatingLabel")}
        <input
          type="number"
          name="fideRating"
          className="rounded border border-foreground/20 bg-transparent px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        {t("ffeRatingLabel")}
        <input
          type="number"
          name="ffeRating"
          className="rounded border border-foreground/20 bg-transparent px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        {t("chesscomRatingLabel")}
        <input
          type="number"
          name="chesscomRating"
          className="rounded border border-foreground/20 bg-transparent px-2 py-1"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {t("submitButton")}
      </button>
    </form>
  );
}
