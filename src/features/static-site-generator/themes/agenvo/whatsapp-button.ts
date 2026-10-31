import { escapeAttribute } from "../../content/html";
import { resolveWhatsAppUrl, whatsappLabels } from "../../content/whatsapp";
import type { PageContext } from "../types";

export function renderWhatsAppButton(context: PageContext): string {
  const url = resolveWhatsAppUrl(
    context.runtime.whatsapp,
    context.content.facts.phone,
    context.locale,
  );

  if (!url) {
    return "";
  }

  const label = escapeAttribute(whatsappLabels[context.locale]);

  return `
  <a data-whatsapp href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}" class="wa-float"><i data-lucide="message-circle" class="w-6 h-6"></i></a>`;
}
