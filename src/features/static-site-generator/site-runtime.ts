import type { WhatsAppSettings } from "./content/whatsapp";

// What a generated site needs to talk to the app: where to send requests and the WhatsApp setting.
export type SiteRuntime = {
  siteId?: string;
  endpoint?: string;
  whatsapp?: WhatsAppSettings;
};

export function createSiteRuntime(siteId: string, whatsapp?: WhatsAppSettings): SiteRuntime {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/+$/, "");

  return { siteId, endpoint: `${base}/api/public/sites/${siteId}/inquiries`, whatsapp };
}
