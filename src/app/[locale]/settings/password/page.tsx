import { getTranslations } from "next-intl/server";
import { ChangePasswordForm } from "@/presentation/components/change-password-form";
import { Card } from "@/presentation/components/ui/card";

export default async function ChangePasswordPage() {
  const t = await getTranslations("ChangePasswordPage");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("description")}</p>
      </div>
      <Card>
        <ChangePasswordForm />
      </Card>
    </main>
  );
}
