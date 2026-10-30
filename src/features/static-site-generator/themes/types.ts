import type { Block, BlockType } from "../blocks/catalog";
import type { Image } from "../blocks/common";
import type { ProjectDetail } from "../content/project-pages";
import type { Locale } from "../locale";
import type { Page, SiteContent } from "../site-content";

export type Tone = "light" | "dark";

export type PhotoCredit = NonNullable<Image["credit"]>;

export type PageMeta = NonNullable<Page["meta"]["en"]>;
export type NavContent = NonNullable<SiteContent["nav"]["en"]>;
export type FooterContent = NonNullable<SiteContent["footer"]["en"]>;

export type AlternatePage = {
  locale: Locale;
  href: string;
};

export type PageContext = {
  content: SiteContent;
  page: Page;
  locale: Locale;
  meta: PageMeta;
  nav: NavContent;
  footer: FooterContent;
  rootPath: string;
  linkPrefix: string;
  alternate?: AlternatePage;
  credits: PhotoCredit[];
};

export type BlockContext = PageContext & {
  tone: Tone;
};

type BlockOfType<T extends BlockType> = Extract<Block, { type: T }>;

export type ThemeBlock<T extends BlockType = BlockType> = T extends BlockType
  ? {
      id: string;
      type: T;
      variant: BlockOfType<T>["variant"];
      props: NonNullable<BlockOfType<T>["props"]["en"]>;
    }
  : never;

export type BlockRenderer<T extends BlockType> = (
  block: ThemeBlock<T>,
  context: BlockContext,
) => string;

export type Theme = {
  id: string;
  name: string;
  assets: string[];
  tones: readonly Tone[];
  renderDocument: (context: PageContext, body: string, headExtra: string) => string;
  renderNav: (context: PageContext) => string;
  renderFooter: (context: PageContext) => string;
  renderProject: (detail: ProjectDetail, context: PageContext) => string;
  blocks: { [T in BlockType]?: BlockRenderer<T> };
};
