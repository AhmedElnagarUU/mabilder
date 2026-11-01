import type { Block } from "../static-site-generator/blocks/catalog";
import { getTemplateDesign, isTemplateId, getTemplate } from "../static-site-generator/site-templates/registry";
import type { SiteTemplate } from "../static-site-generator/site-templates/types";
import type { SiteContent } from "../static-site-generator/site-content";

function withTemplateDesign(block: Block, template: SiteTemplate): Block {
  return { ...block, design: getTemplateDesign(template, block.type) } as Block;
}

// Only the look changes: theme and each block's design. Props, ids, order, hidden, facts, nav,
// footer and images stay as they are.
export function applyTemplateDefinition(content: SiteContent, template: SiteTemplate): SiteContent {
  return {
    ...content,
    theme: template.id,
    pages: content.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => withTemplateDesign(block, template)),
    })),
  };
}

export function applyTemplate(content: SiteContent, templateId: string): SiteContent {
  if (!isTemplateId(templateId)) {
    return content;
  }

  return applyTemplateDefinition(content, getTemplate(templateId));
}
