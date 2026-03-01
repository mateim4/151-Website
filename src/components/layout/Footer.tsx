import { useTranslations } from "next-intl";
import { Logo151 } from "@/components/ui/Logo151";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--151-border-subtle)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo151 size="sm" />
            <p className="text-sm text-[var(--151-text-muted)]">
              {t("tagline")}
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-[var(--151-text-muted)]">
            <span>{t("copyright", { year: String(year) })}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
