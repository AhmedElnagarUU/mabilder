import { demoContent, heroPreviewImage, heroTitleOf } from "@/features/templates-gallery/demo/demo-content";
import type { Locale } from "@/features/static-site-generator/locale";
import type { SiteTemplate } from "@/features/static-site-generator/site-templates/types";

// The gallery card cover: a small CSS-only mock of the demo home page drawn with the template's
// own tokens (colors, fonts) and the fixed demo content. No screenshot and no iframe needed.
export async function TemplateCover({ template, locale }: { template: SiteTemplate; locale: Locale }) {
  const { tokens } = template;
  const heroImage = heroPreviewImage(locale);
  const businessName = demoContent.facts.businessName;
  const heroTitle = heroTitleOf(locale);

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: tokens.bg, color: tokens.ink }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <span className="truncate text-[15px]" style={{ fontFamily: tokens.fontDisplay }}>
          {businessName}
        </span>
        <span className="flex shrink-0 gap-1.5" aria-hidden>
          <i className="h-[3px] w-6 rounded-full" style={{ backgroundColor: tokens.accent }} />
          <i
            className="h-[3px] w-6 rounded-full opacity-50"
            style={{ backgroundColor: tokens.ink }}
          />
          <i
            className="h-[3px] w-6 rounded-full opacity-50"
            style={{ backgroundColor: tokens.ink }}
          />
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroImage.src}
        alt={heroImage.alt}
        loading="lazy"
        className="h-36 w-full object-cover sm:h-40"
      />
      <div className="flex items-end justify-between gap-3 px-4 py-3.5">
        <span
          className="line-clamp-2 text-[17px] leading-snug"
          style={{ fontFamily: tokens.fontDisplay }}
        >
          {heroTitle}
        </span>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide"
          style={{ backgroundColor: tokens.accent, color: tokens.bg }}
        >
          {template.name}
        </span>
      </div>
    </div>
  );
}
