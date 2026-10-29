import type { ZodError } from "zod";
import type { Locale } from "../static-site-generator/locale";
import type { SiteContent } from "../static-site-generator/site-content";
import {
  getSite,
  saveContent,
  type ContentIssue,
  type SaveContentResult,
} from "../site-creation/service";
import { seoInputSchema, type SeoInput } from "./types";

function zodIssues(error: ZodError): ContentIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "input",
    message: issue.message,
  }));
}

function hasSiteLocales(
  meta: SeoInput["pages"][number]["meta"],
  locales: Locale[],
): boolean {
  const keys = Object.keys(meta);
  return keys.length === locales.length && locales.every((locale) => keys.includes(locale));
}

function contentIssues(input: SeoInput, content: SiteContent): ContentIssue[] {
  return input.pages.flatMap((page, index) => {
    if (!content.pages.some((existing) => existing.id === page.id)) {
      return [{ path: `pages.${index}.id`, message: "Unknown page." }];
    }

    if (!hasSiteLocales(page.meta, content.locales)) {
      return [
        {
          path: `pages.${index}.meta`,
          message: "Each page needs a title and description for every site language, and no others.",
        },
      ];
    }

    return [];
  });
}

function applySeo(content: SiteContent, input: SeoInput): SiteContent {
  return {
    ...content,
    pages: content.pages.map((page) => {
      const update = input.pages.find((item) => item.id === page.id);
      return update ? { ...page, meta: update.meta } : page;
    }),
  };
}

// Returns null when the site is not the owner's. Saving re-renders the site; no AI.
export async function updateSeo(
  ownerId: string,
  siteId: string,
  input: unknown,
): Promise<SaveContentResult> {
  const site = await getSite(ownerId, siteId);

  if (!site) {
    return null;
  }

  if (!site.content) {
    return { ok: false, errors: [{ path: "content", message: "The site has no content yet." }] };
  }

  const parsed = seoInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, errors: zodIssues(parsed.error) };
  }

  const issues = contentIssues(parsed.data, site.content);

  if (issues.length > 0) {
    return { ok: false, errors: issues };
  }

  return saveContent(ownerId, siteId, applySeo(site.content, parsed.data));
}
