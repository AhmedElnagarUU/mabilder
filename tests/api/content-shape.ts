import type { SiteContent } from "../../src/features/static-site-generator/site-content";

type HeroBlock = Extract<SiteContent["pages"][number]["blocks"][number], { type: "hero" }>;

function homePage(content: SiteContent): SiteContent["pages"][number] {
  return content.pages[0];
}

export function withHomeTitle(content: unknown, title: string): SiteContent {
  const copy = structuredClone(content) as SiteContent;
  const hero = homePage(copy).blocks.find((block): block is HeroBlock => block.type === "hero");

  if (!hero) {
    throw new Error("The home page has no hero block.");
  }

  for (const locale of copy.locales) {
    const props = hero.props[locale];

    if (props) {
      props.title = title;
    }
  }

  return copy;
}

export function homeBlockIds(content: unknown): string[] {
  return homePage(content as SiteContent).blocks.map((block) => block.id);
}

export function withHomeBlocksSwapped(content: unknown, first: number, second: number): SiteContent {
  const copy = structuredClone(content) as SiteContent;
  const blocks = homePage(copy).blocks;
  [blocks[first], blocks[second]] = [blocks[second], blocks[first]];
  return copy;
}

export function withHomeBlockHidden(content: unknown, blockId: string): SiteContent {
  const copy = structuredClone(content) as SiteContent;
  const block = homePage(copy).blocks.find((candidate) => candidate.id === blockId);

  if (!block) {
    throw new Error(`The home page has no block "${blockId}".`);
  }

  block.hidden = true;
  return copy;
}
