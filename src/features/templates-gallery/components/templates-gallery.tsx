import { getTranslations } from "next-intl/server";
import { listTemplates } from "@/features/static-site-generator/site-templates/registry";
import type { Locale } from "@/features/static-site-generator/locale";
import { TemplateCard } from "./template-card";

export async function TemplatesGallery({ locale }: { locale: Locale }) {
  const t = await getTranslations("templatesGallery");
  const templates = listTemplates();

  return (
    <main className="flex-1">
      <div className="mx-auto w-[min(1180px,calc(100%-40px))] pb-20 pt-12 sm:pt-16">
        <header className="max-w-2xl">
          <p className="mono-label mb-3 text-[10px] font-normal tracking-[0.18em] text-faint">
            {t("page.eyebrow")}
          </p>
          <h1 className="text-3xl font-medium tracking-[-0.02em] text-ink sm:text-4xl">
            {t("page.title")}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{t("page.subtitle")}</p>
        </header>

        <ul className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} locale={locale} />
          ))}
        </ul>

        <p className="mt-10 max-w-2xl text-[12px] leading-relaxed text-faint">
          {t("page.demoNote")}
        </p>
      </div>
    </main>
  );
}
