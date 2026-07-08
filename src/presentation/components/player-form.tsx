"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  registerPlayerAction,
  type RegisterPlayerFormState,
} from "@/app/[locale]/players/actions";
import { Card } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { inputClasses, labelClasses } from "@/presentation/components/ui/input";

const initialState: RegisterPlayerFormState = { error: null };

export function PlayerForm() {
  const t = useTranslations("PlayersPage");
  const [state, formAction, isPending] = useActionState(
    registerPlayerAction,
    initialState,
  );

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">
          {t("addPlayerHeading")}
        </h2>

        <label className={labelClasses}>
          {t("nameLabel")}
          <input name="name" required className={inputClasses} />
        </label>

        <label className={labelClasses}>
          {t("typeLabel")}
          <select name="type" defaultValue="family" className={inputClasses}>
            <option value="family">{t("typeFamily")}</option>
            <option value="guest">{t("typeGuest")}</option>
          </select>
        </label>

        <label className={labelClasses}>
          {t("birthDateLabel")}
          <input type="date" name="birthDate" className={inputClasses} />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className={labelClasses}>
            {t("fideRatingLabel")}
            <input type="number" name="fideRating" className={inputClasses} />
          </label>

          <label className={labelClasses}>
            {t("ffeRatingLabel")}
            <input type="number" name="ffeRating" className={inputClasses} />
          </label>

          <label className={labelClasses}>
            {t("chesscomRatingLabel")}
            <input type="number" name="chesscomRating" className={inputClasses} />
          </label>
        </div>

        {state.error ? (
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="self-start">
          {t("submitButton")}
        </Button>
      </form>
    </Card>
  );
}
