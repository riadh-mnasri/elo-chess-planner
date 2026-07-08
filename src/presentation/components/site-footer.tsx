import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("ChangePasswordPage");

  return (
    <footer className="flex flex-col items-center gap-1 border-t border-border py-6 text-center text-xs text-muted print:hidden">
      <span>© {new Date().getFullYear()} Riadh MNASRI</span>
      <Link href="/settings/password" className="hover:text-foreground hover:underline">
        {t("changeLink")}
      </Link>
    </footer>
  );
}
