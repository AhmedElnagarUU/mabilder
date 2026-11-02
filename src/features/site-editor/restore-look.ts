import type { Block } from "../static-site-generator/blocks/catalog";
import type { SiteContent } from "../static-site-generator/site-content";

// Undo of a template pick: puts back the old theme and each block's old design. Everything the
// customer edited after the pick (text, photos, order) stays as it is now.
export function restoreLook(current: SiteContent, previous: SiteContent): SiteContent {
  const previousDesigns = new Map(
    previous.pages.flatMap((page) => page.blocks).map((block) => [block.id, block.design] as const),
  );

  return {
    ...current,
    theme: previous.theme,
    pages: current.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (!previousDesigns.has(block.id)) {
          return block;
        }

        // An old block may have had no design (legacy variant); drop the picked one so it reads as before.
        const design = previousDesigns.get(block.id);
        const restored: { design?: string } = { ...block };

        if (design === undefined) {
          delete restored.design;
        } else {
          restored.design = design;
        }

        return restored as Block;
      }),
    })),
  };
}
