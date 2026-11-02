import type { ReactNode } from "react";
import type { SiteContent } from "../static-site-generator/site-content";

// One card of the template chooser. The cover is rendered on the server (gallery cover) and handed
// to the client chooser as a ready node.
export type TemplateChoice = {
  id: string;
  name: string;
  mood: string;
  cover: ReactNode;
};

export type ApplyTemplateOutcome =
  | { ok: true; content: SiteContent }
  | { ok: false; code: "invalid" | "subscription_required" | "failed" };

export async function requestTemplate(
  siteId: string,
  templateId: string,
): Promise<ApplyTemplateOutcome> {
  try {
    const response = await fetch(`/api/sites/${siteId}/template`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    });

    if (response.status === 400) {
      return { ok: false, code: "invalid" };
    }

    if (response.status === 402) {
      return { ok: false, code: "subscription_required" };
    }

    if (!response.ok) {
      return { ok: false, code: "failed" };
    }

    const body = (await response.json()) as { site: { content: SiteContent } };
    return { ok: true, content: body.site.content };
  } catch {
    return { ok: false, code: "failed" };
  }
}
