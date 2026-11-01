import { getTranslations } from "next-intl/server";
import type { Locale } from "@/features/static-site-generator/locale";
import type { SiteTemplate } from "@/features/static-site-generator/site-templates/types";
import { TemplateCover } from "./template-cover";

export async function TemplateCard({ template, locale }: { template: SiteTemplate; locale: Locale }) {
  const t = await getTranslations("templatesGallery.page");
  const previewHref = `/${locale}/templates/${template.id}/preview`;

  return (
    <li className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-panel transition-colors hover:border-white/20">
      <a
        href={previewHref}
        target="_blank"
        rel="noopener"
        aria-label={t("coverAria", { name: template.name })}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <TemplateCover template={template} locale={locale} />
      </a>

      <div className="flex flex-1 flex-col gap-2 p-5 pt-4">
        <h2 className="text-[15px] font-medium text-ink">{template.name}</h2>
        <p className="text-[13px] leading-relaxed text-muted">{template.mood[locale]}</p>

        <a
          href={previewHref}
          target="_blank"
          rel="noopener"
          className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-line px-4 py-2 text-[12px] text-soft transition-colors hover:border-white/25 hover:text-ink"
        >
          {t("preview")}
          <span aria-hidden className="text-[10px]">
            ↗
          </span>
          <span className="sr-only">{t("newTab")}</span>
        </a>
      </div>
    </li>
  );
}
