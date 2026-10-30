import type { CreditBalance } from "../credits/types";
import type { SiteContent } from "../static-site-generator/site-content";

export type RewriteError =
  | { code: "credits_exhausted"; nextResetAt: string | null }
  | { code: "subscription_required" }
  | { code: "generic" };

export type RewriteOutcome =
  | { ok: true; content: SiteContent; balance: CreditBalance }
  | { ok: false; error: RewriteError };

type RewriteBody = {
  site?: { content: SiteContent | null };
  balance?: CreditBalance;
  code?: string;
  nextResetAt?: string | null;
};

function toError(status: number, body: RewriteBody): RewriteError {
  if (status === 429 && body.code === "credits_exhausted") {
    return { code: "credits_exhausted", nextResetAt: body.nextResetAt ?? null };
  }

  return status === 402 ? { code: "subscription_required" } : { code: "generic" };
}

export async function requestRewrite(
  siteId: string,
  pageId: string,
  blockIds: string[],
  instruction: string,
): Promise<RewriteOutcome> {
  try {
    const response = await fetch(`/api/sites/${siteId}/rewrite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, blockIds, instruction }),
    });
    const body = (await response.json().catch(() => ({}))) as RewriteBody;

    if (response.ok && body.site?.content && body.balance) {
      return { ok: true, content: body.site.content, balance: body.balance };
    }

    return { ok: false, error: toError(response.status, body) };
  } catch {
    return { ok: false, error: { code: "generic" } };
  }
}
