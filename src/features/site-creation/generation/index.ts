import { ChatOpenAI } from "@langchain/openai";
import type { SiteContent } from "../../static-site-generator/content/types";
import { finalizeContent } from "../base-content";
import type { BusinessBrief } from "../types";
import { generatePageEntries } from "./pages";
import { collectPagePaths, mergeEntries, type PageKey } from "./paths";
import { normalizeBusinessProfile } from "./profile";

export const pageKeys = [
  "home",
  "about",
  "services",
  "work",
  "profile",
  "contact",
] as const satisfies readonly PageKey[];

const pageLabels: Record<PageKey, string> = {
  home: "Home",
  about: "Studio",
  services: "Services",
  work: "Work",
  profile: "Profile",
  contact: "Contact",
};

// OpenRouter speaks the OpenAI API, so ChatOpenAI only needs its base URL.
function createGenerationModel(): ChatOpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set.");
  }

  return new ChatOpenAI({
    apiKey,
    model: process.env.OPENROUTER_MODEL ?? "xingchen-agi/xing4.0-29b-a4b:free",
    configuration: { baseURL: "https://openrouter.ai/api/v1" },
    temperature: 0.7,
    maxRetries: 0,
  });
}

export async function generateSiteContent(
  brief: BusinessBrief,
  base: SiteContent,
): Promise<SiteContent> {
  const model = createGenerationModel();
  const startedAt = Date.now();
  const elapsed = () => `${Math.round((Date.now() - startedAt) / 1000)}s`;

  console.log(`[generation] profile start ${elapsed()}`);
  const profile = await normalizeBusinessProfile(model, brief);
  console.log(`[generation] profile done ${elapsed()}`);

  const pageEntries = await Promise.all(
    pageKeys.map(async (pageKey) => {
      const structure =
        pageKey === "home"
          ? {
              site: base.site,
              navigation: base.navigation,
              footer: base.footer,
              page: base.pages[pageKey],
            }
          : { page: base.pages[pageKey] };

      const result = await generatePageEntries(model, {
        pageLabel: pageLabels[pageKey],
        brief,
        profile,
        structure,
        paths: collectPagePaths(pageKey, base),
      });

      console.log(`[generation] page done ${pageKey} ${elapsed()}`);
      return result;
    }),
  );

  const entries = new Map<string, string>();

  for (const page of pageEntries) {
    for (const [path, text] of page) {
      entries.set(path, text);
    }
  }

  return finalizeContent(mergeEntries(base, entries), brief);
}
