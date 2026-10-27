import { z } from "zod";
import { blockSchema } from "./blocks/catalog";
import { linkSchema, nonEmptyText } from "./blocks/common";
import { factsSchema } from "./blocks/facts";
import { localeSchema, localized, type Locale } from "./locale";

export const pageSlugSchema = z.enum([
  "index",
  "about",
  "services",
  "projects",
  "contact",
]);

export const pageSchema = z.object({
  id: nonEmptyText,
  slug: pageSlugSchema,
  meta: localized(
    z.object({
      title: nonEmptyText,
      description: nonEmptyText,
    }),
  ),
  blocks: z.array(blockSchema),
});

function checkLocaleKeys(
  value: Record<string, unknown>,
  locales: Locale[],
  path: (string | number)[],
  ctx: z.RefinementCtx,
): void {
  const keys = Object.keys(value);
  const missing = locales.filter((locale) => !keys.includes(locale));
  const extra = keys.filter((key) => !locales.includes(key as Locale));

  if (missing.length === 0 && extra.length === 0) {
    return;
  }

  const details = [
    missing.length > 0 ? `missing ${missing.join(", ")}` : "",
    extra.length > 0 ? `unexpected ${extra.join(", ")}` : "",
  ].filter(Boolean);

  ctx.addIssue({
    code: "custom",
    message: `Localized value must match locales (${details.join("; ")}).`,
    path,
  });
}

export const siteContentSchema = z
  .object({
    theme: nonEmptyText,
    locales: z.array(localeSchema).min(1).max(2),
    defaultLocale: localeSchema,
    facts: factsSchema,
    nav: localized(
      z.object({
        items: z.array(linkSchema),
        cta: linkSchema,
        menuLabel: nonEmptyText,
        languageLabel: nonEmptyText,
      }),
    ),
    footer: localized(
      z.object({
        blurb: nonEmptyText,
        copyright: nonEmptyText,
        photoCreditLabel: nonEmptyText,
      }),
    ),
    pages: z.array(pageSchema).min(1),
  })
  .superRefine((content, ctx) => {
    if (!content.locales.includes(content.defaultLocale)) {
      ctx.addIssue({
        code: "custom",
        message: "defaultLocale must be one of locales.",
        path: ["defaultLocale"],
      });
    }

    if (new Set(content.locales).size !== content.locales.length) {
      ctx.addIssue({
        code: "custom",
        message: "locales must be unique.",
        path: ["locales"],
      });
    }

    if (content.pages[0]?.slug !== "index") {
      ctx.addIssue({
        code: "custom",
        message: 'The first page must have slug "index".',
        path: ["pages", 0, "slug"],
      });
    }

    checkLocaleKeys(content.nav, content.locales, ["nav"], ctx);
    checkLocaleKeys(content.footer, content.locales, ["footer"], ctx);

    const blockIds = new Set<string>();

    content.pages.forEach((page, pageIndex) => {
      checkLocaleKeys(page.meta, content.locales, ["pages", pageIndex, "meta"], ctx);

      page.blocks.forEach((block, blockIndex) => {
        checkLocaleKeys(
          block.props,
          content.locales,
          ["pages", pageIndex, "blocks", blockIndex, "props"],
          ctx,
        );

        if (blockIds.has(block.id)) {
          ctx.addIssue({
            code: "custom",
            message: `Duplicate block id "${block.id}".`,
            path: ["pages", pageIndex, "blocks", blockIndex, "id"],
          });
        }

        blockIds.add(block.id);
      });
    });
  });

export type PageSlug = z.infer<typeof pageSlugSchema>;
export type Page = z.infer<typeof pageSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
