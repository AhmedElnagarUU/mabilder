import { refreshFactBlocks } from "../site-creation/refresh-facts";
import { getSite, saveContent } from "../site-creation/service";
import { listApprovedReviews } from "./repository";

// Facts are rebuilt in code from the approved reviews and the site is rendered again. No AI call.
export async function publishReviews(ownerId: string, siteId: string): Promise<void> {
  const site = await getSite(ownerId, siteId);

  if (!site?.content) {
    return;
  }

  const reviews = await listApprovedReviews(siteId);
  const content = refreshFactBlocks(
    site.content,
    site.brief,
    site.content.facts.projects,
    new Date().getFullYear(),
    reviews,
  );
  const saved = await saveContent(ownerId, siteId, content);

  if (!saved?.ok) {
    throw new Error("Failed to update the website with the reviews.");
  }
}
