import { z } from "zod";
import { getSite, saveContent, type SaveContentResult } from "../site-creation/service";
import { isTemplateId } from "../static-site-generator/site-templates/registry";
import { applyTemplate } from "./apply-template";

export const applyTemplateBodySchema = z.object({
  templateId: z.string().refine(isTemplateId, "Unknown template."),
});

// Picking a template changes only the look. It goes through the normal content save, so the site
// is validated, stored and rebuilt exactly like an editor save. No AI, no credits, no Pexels.
export async function applyTemplateToSite(
  ownerId: string,
  siteId: string,
  templateId: string,
): Promise<SaveContentResult> {
  const site = await getSite(ownerId, siteId);

  if (!site?.content) {
    return null;
  }

  return saveContent(ownerId, siteId, applyTemplate(site.content, templateId));
}
