import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import type { Locale } from "../../static-site-generator/locale";
import {
  siteContentSchema,
  pageSlugSchema,
  type Page,
  type PageSlug,
  type SiteContent,
} from "../../static-site-generator/site-content";
import type { BusinessBrief } from "../types";
import type { GenerationModel } from "./index";
import type { BusinessProfile } from "./profile";
import { buildSeoPrompt, seoSystemPrompt } from "./prompts";
import { requestOptions, runRateLimited } from "./rate-limit";
import type { SpendGuard } from "./spend-guard";

const maxTitle = 60;
const maxDescription = 160;
const minDescription = 50;

export type SeoBackground = {
  brief: BusinessBrief;
  profile?: BusinessProfile;
};

export type PageMeta = {
  title: string;
  description: string;
};

type SeoAnswer = {
  pages: Array<{ slug: PageSlug; title: string; description: string }>;
};

const seoAnswerSchema = z.object({
  pages: z.array(
    z.object({
      slug: pageSlugSchema,
      title: z.string(),
      description: z.string(),
    }),
  ),
});

function trimToWord(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, " ");

  if (clean.length <= max) {
    return clean;
  }

  const cut = clean.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(" ");

  return (lastSpace > 0 ? cut.slice(0, lastSpace) : clean.slice(0, max)).trim();
}

// The profile summary is used only when it is written in this locale's script.
function summaryFor(locale: Locale, profile: BusinessProfile | undefined): string | undefined {
  const summary = profile?.summary.trim();
  const isArabic = summary ? /[؀-ۿ]/.test(summary) : false;

  return summary && isArabic === (locale === "ar") ? summary : undefined;
}

function fallbackMeta(page: Page, locale: Locale, profile: BusinessProfile | undefined): PageMeta {
  const summary = summaryFor(locale, profile);

  return {
    title: page.meta[locale]!.title,
    description: trimToWord(summary ?? page.meta[locale]!.description, maxDescription),
  };
}

function answerMeta(answer: SeoAnswer, slug: PageSlug): PageMeta | undefined {
  const page = answer.pages.find((candidate) => candidate.slug === slug);

  if (!page) {
    return undefined;
  }

  const title = trimToWord(page.title, maxTitle);
  const description = trimToWord(page.description, maxDescription);

  if (title === "" || description.length < minDescription) {
    return undefined;
  }

  return { title, description };
}

function buildPageMeta(
  answer: SeoAnswer | null,
  content: SiteContent,
  locale: Locale,
  profile: BusinessProfile | undefined,
): Record<PageSlug, PageMeta> {
  return Object.fromEntries(
    content.pages.map((page) => [
      page.slug,
      (answer && answerMeta(answer, page.slug)) ?? fallbackMeta(page, locale, profile),
    ]),
  ) as Record<PageSlug, PageMeta>;
}

async function requestSeo(
  model: GenerationModel,
  content: SiteContent,
  background: SeoBackground,
  locale: Locale,
  guard: SpendGuard,
): Promise<SeoAnswer | null> {
  try {
    const structured = model.withStructuredOutput(seoAnswerSchema, { name: "page_seo" });
    const answer = await runRateLimited(() => {
      guard.startCall();
      return structured.invoke(
        [
          new SystemMessage(seoSystemPrompt),
          new HumanMessage(
            buildSeoPrompt({
              ...background,
              facts: content.facts,
              locale,
              pages: content.pages.map((page) => ({
                slug: page.slug,
                title: page.meta[locale]!.title,
              })),
            }),
          ),
        ],
        requestOptions(guard.signal),
      );
    });

    return seoAnswerSchema.parse(answer);
  } catch (error) {
    if (guard.signal.aborted) {
      throw error;
    }

    console.error("Page SEO generation failed; using template meta.", error);
    return null;
  }
}

// One SEO call per site locale; a failed locale keeps the template meta.
export async function writeSiteSeo(
  model: GenerationModel,
  content: SiteContent,
  background: SeoBackground,
  guard: SpendGuard,
): Promise<SiteContent> {
  const meta = {} as Record<Locale, Record<PageSlug, PageMeta>>;

  for (const locale of content.locales) {
    const answer = await requestSeo(model, content, background, locale, guard);
    meta[locale] = buildPageMeta(answer, content, locale, background.profile);
  }

  return siteContentSchema.parse({
    ...content,
    pages: content.pages.map((page) => ({
      ...page,
      meta: Object.fromEntries(content.locales.map((locale) => [locale, meta[locale][page.slug]])),
    })),
  });
}
