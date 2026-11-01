import assert from "node:assert/strict";
import { test } from "node:test";
import { InquiryModel } from "../../src/features/inquiries/model";
import { normalizePhone } from "../../src/features/inquiries/phone";
import { findContentSpam } from "../../src/features/inquiries/spam";
import { quoteSchema, visitSchema } from "../../src/features/inquiries/types";
import { isVisitDayAllowed } from "../../src/features/inquiries/visit-day";
import { renderEmail } from "../../src/features/notifications/templates";
import type { Facts } from "../../src/features/static-site-generator/blocks/facts";
import { contactBlock } from "../../src/features/static-site-generator/blocks/contact";
import { contactFormLabels } from "../../src/features/static-site-generator/blocks/contact-options";
import {
  buildWhatsAppUrl,
  whatsappMessages,
} from "../../src/features/static-site-generator/content/whatsapp";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import { createSiteRuntime } from "../../src/features/static-site-generator/site-runtime";
import { composeFor, richBrief, richProjects, thinBrief } from "./samples";

const SITE_ID = "64b000000000000000000001";
const APP_URL = "https://app.example.com";

function renderFiles(brief: Record<string, string>, whatsapp?: { enabled: boolean; number?: string }) {
  process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  const content = composeFor(brief, [], ["en", "ar"]);
  return renderSite(content, "", createSiteRuntime(SITE_ID, whatsapp));
}

function htmlOf(files: { fileName: string; html: string }[], fileName: string): string {
  const file = files.find((candidate) => candidate.fileName === fileName);
  assert.ok(file, `${fileName} was not rendered`);
  return file.html;
}

test("the contact form lists the services from the facts, has the honeypot and the endpoint", () => {
  const html = htmlOf(renderFiles(richBrief), "en/contact.html");

  for (const service of ["Architecture", "Engineering", "Interiors", "Landscape"]) {
    assert.ok(html.includes(`<option value="${service}">${service}</option>`), `${service} option missing`);
  }

  assert.ok(html.includes(`data-site-id="${SITE_ID}"`));
  assert.ok(html.includes(`data-endpoint="${APP_URL}/api/public/sites/${SITE_ID}/inquiries"`));
  assert.ok(html.includes(`action="${APP_URL}/api/public/sites/${SITE_ID}/inquiries"`));
  assert.match(html, /<input name="website"[^>]*tabindex="-1"/);
  assert.match(html, /<input name="phone" type="tel" required/);
  assert.match(html, /<input name="email" type="email" placeholder/);
  assert.ok(html.includes(contactFormLabels.en.privacyNote));
});

test("budget and start options are the fixed sets in the page language", () => {
  const files = renderFiles(richBrief);

  assert.ok(htmlOf(files, "en/contact.html").includes(`<option value="small">${contactFormLabels.en.budgetOptions.small}</option>`));
  assert.ok(htmlOf(files, "ar/contact.html").includes(`<option value="month">${contactFormLabels.ar.startOptions.month}</option>`));
});

test("services are escaped in the options", () => {
  const html = htmlOf(renderFiles({ ...richBrief, services: "Tom & Jerry <script>alert(1)</script>" }), "en/contact.html");

  assert.ok(html.includes("Tom &amp; Jerry &lt;script&gt;"));
  assert.ok(!html.includes("<script>alert(1)"));
});

test("a service-less site has no service list but keeps phone and budget", () => {
  const html = htmlOf(renderFiles({ ...richBrief, services: "" }), "en/contact.html");

  assert.ok(!html.includes('name="service"'));
  assert.ok(html.includes('name="budget"'));
});

test("the demo sentence is gone from the contact fixtures", () => {
  for (const fixture of Object.values(contactBlock.fixtures)) {
    assert.ok(!/demo|no message is actually sent/i.test(fixture.form.successMessage));
  }
});

test("the WhatsApp link holds only digits and an encoded message in the page language", () => {
  const files = renderFiles(richBrief);
  const english = htmlOf(files, "en/index.html");
  const arabic = htmlOf(files, "ar/index.html");

  assert.ok(english.includes(`href="https://wa.me/41441234567?text=${encodeURIComponent(whatsappMessages.en)}"`));
  assert.ok(arabic.includes(`href="https://wa.me/41441234567?text=${encodeURIComponent(whatsappMessages.ar)}"`));
  assert.match(english, /class="wa-float"/);
});

test("a separate WhatsApp number wins, and an Egyptian local number gets the country code", () => {
  const html = htmlOf(renderFiles(richBrief, { enabled: true, number: "010 0123 4567" }), "en/index.html");

  assert.ok(html.includes("https://wa.me/201001234567?text="));
  assert.equal(buildWhatsAppUrl("+20 (100) 123-4567", "en")?.split("?")[0], "https://wa.me/201001234567");
});

test("there is no WhatsApp button without a phone, or when it is switched off", () => {
  assert.ok(!htmlOf(renderFiles(thinBrief), "en/index.html").includes("data-whatsapp"));
  assert.ok(!htmlOf(renderFiles(richBrief, { enabled: false }), "en/index.html").includes("data-whatsapp"));
  assert.equal(buildWhatsAppUrl("abc", "en"), null);
});

test("phones are normalised and bad ones are refused", () => {
  assert.equal(normalizePhone("0100 123 4567"), "+201001234567");
  assert.equal(normalizePhone("+20 100 123 4567"), "+201001234567");
  assert.equal(normalizePhone("201001234567"), "+201001234567");
  assert.equal(normalizePhone("+971 50 123 4567"), "+971501234567");
  assert.equal(normalizePhone("0020 100 123 4567"), "+201001234567");

  for (const bad of ["12345", "abcdefghij", "01301234567", "+12", "0100123456789012345"]) {
    assert.equal(normalizePhone(bad), null, bad);
  }
});

test("content spam reasons come from their own cases", () => {
  const base = { name: "Sara Ali", phone: "+201001234567" };

  assert.equal(findContentSpam({ ...base, message: "I need a villa design in Cairo." }), null);
  assert.equal(findContentSpam({ ...base, message: "Visit http://spam.example now" }), "links");
  assert.equal(findContentSpam({ ...base, message: "cheap at www.a.com" }), "links");
  assert.equal(findContentSpam({ ...base, message: "see a.com and b.net" }), "links");
  assert.equal(findContentSpam({ ...base, name: "buy at spam.com" }), "name_link");
  assert.equal(findContentSpam({ ...base, message: "12345 67890 !!!! 9999 ####" }), "gibberish");
  assert.equal(findContentSpam({ ...base, message: "أحتاج تصميم فيلا في القاهرة" }), null);
});

test("the quote schema rejects unknown fields and bad option keys", () => {
  const ok = { name: "Sara", phone: "01001234567" };

  assert.ok(quoteSchema.safeParse(ok).success);
  assert.ok(!quoteSchema.safeParse({ ...ok, admin: true }).success);
  assert.ok(!quoteSchema.safeParse({ ...ok, budget: "999" }).success);
});

test("the inquiry model deletes documents by date: a TTL index on expiresAt exists", () => {
  const indexes = InquiryModel.schema.indexes();
  const ttl = indexes.find(([fields]) => "expiresAt" in fields);

  assert.ok(ttl, "expiresAt index missing");
  assert.equal(ttl[1].expireAfterSeconds, 0);
});

test("the contact section shows a quote, a visit and a review form, each with its own hidden kind", () => {
  const html = htmlOf(renderFiles(richBrief), "en/contact.html");

  assert.equal(html.match(/<form data-form/g)?.length, 3);
  assert.ok(html.includes('<input type="hidden" name="kind" value="quote" />'));
  assert.ok(html.includes('<input type="hidden" name="kind" value="visit" />'));
  assert.ok(html.includes('<input type="hidden" name="kind" value="review" />'));
  assert.match(html, /role="tablist"[^>]*data-tablist class="hidden/);
  assert.equal(html.match(/role="tab"/g)?.length, 3);
  assert.equal(html.match(/role="tabpanel"/g)?.length, 3);
  assert.ok(html.includes(`>${contactFormLabels.en.quoteTabLabel}</button>`));
  assert.ok(html.includes(`>${contactFormLabels.en.visitTabLabel}</button>`));
  assert.match(html, /<input name="preferredDay" type="date" required data-visit-day/);
  assert.ok(html.includes('<option value="morning">Morning</option>'));
  assert.ok(html.includes('<option value="evening">Evening</option>'));
  assert.equal(html.match(/name="projectSlug"/g)?.length, 2);
  assert.ok(!html.includes("undefined"));
});

test("the visit form uses the arabic labels and the services from the facts", () => {
  const html = htmlOf(renderFiles(richBrief), "ar/contact.html");

  assert.ok(html.includes(`>${contactFormLabels.ar.visitTabLabel}</button>`));
  assert.ok(html.includes('<option value="morning">صباحًا</option>'));
  assert.ok(html.includes(`${contactFormLabels.ar.aboutLabel}`));
  assert.equal(html.match(/<option value="Interiors">Interiors<\/option>/g)?.length, 2);
});

test("labels written for the visit form win over the fixed ones", () => {
  const content = composeFor(richBrief, [], ["en"]);
  const contactBlockOnPage = content.pages
    .flatMap((page) => page.blocks)
    .find((block) => block.type === "contact");
  assert.ok(contactBlockOnPage && contactBlockOnPage.type === "contact");

  const form = contactBlockOnPage.props.en?.form;
  assert.ok(form);
  form.visitTabLabel = "Visit us on site";
  process.env.NEXT_PUBLIC_APP_URL = APP_URL;

  const html = htmlOf(renderSite(content, "", createSiteRuntime(SITE_ID)), "contact.html");

  assert.ok(html.includes(">Visit us on site</button>"));
});

test("the project page links to the contact page of the same language with the project slug", () => {
  process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  const content = composeFor(richBrief, richProjects, ["en", "ar"]);
  const files = renderSite(content, "", createSiteRuntime(SITE_ID));
  const english = htmlOf(files, "en/projects/corporate-tower.html");
  const arabic = htmlOf(files, "ar/projects/corporate-tower.html");

  assert.ok(english.includes('href="../contact.html?project=corporate-tower" data-project-ask'));
  assert.ok(english.includes("Ask about this project"));
  assert.ok(arabic.includes('href="../contact.html?project=corporate-tower" data-project-ask'));
  assert.ok(arabic.includes("اسأل عن هذا المشروع"));
  assert.ok(!english.includes("undefined") && !arabic.includes("undefined"));
});

test("a single-language site links to its own contact page", () => {
  process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  const content = composeFor(richBrief, richProjects, ["en"]);
  const html = htmlOf(renderSite(content, "", createSiteRuntime(SITE_ID)), "projects/corporate-tower.html");

  assert.ok(html.includes('href="../contact.html?project=corporate-tower" data-project-ask'));
});

test("the contact form carries each project's slug and escaped title for site.js", () => {
  const tricky: Facts["projects"] = [
    { ...richProjects[0], title: 'Villa "A" <script>alert(1)</script>' },
    richProjects[0],
  ];
  process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  const html = htmlOf(
    renderSite(composeFor(richBrief, tricky, ["en"]), "", createSiteRuntime(SITE_ID)),
    "contact.html",
  );

  assert.ok(html.includes('data-project-slug="corporate-tower" data-project-title="Corporate Tower"'));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(!html.includes("<script>alert(1)"));
  assert.ok(!html.includes("undefined"));
});

test("the visit schema needs a day, limits the time of day and rejects unknown fields", () => {
  const ok = { name: "Omar", phone: "01001234567", preferredDay: "2026-11-20" };

  assert.ok(visitSchema.safeParse(ok).success);
  assert.ok(visitSchema.safeParse({ ...ok, preferredTime: "evening" }).success);
  assert.ok(!visitSchema.safeParse({ ...ok, preferredTime: "noon" }).success);
  assert.ok(!visitSchema.safeParse({ name: "Omar", phone: "01001234567" }).success);
  assert.ok(!visitSchema.safeParse({ ...ok, budget: "large" }).success);
});

test("a visit day is allowed from today to 12 months ahead for any time zone", () => {
  const now = new Date("2026-11-01T10:00:00Z");

  assert.ok(isVisitDayAllowed("2026-11-01", now));
  assert.ok(isVisitDayAllowed("2026-10-31", now), "a visitor still on the previous day");
  assert.ok(isVisitDayAllowed("2027-11-02", now), "a visitor already on the next day");
  assert.ok(!isVisitDayAllowed("2026-10-30", now));
  assert.ok(!isVisitDayAllowed("2027-11-03", now));
  assert.ok(!isVisitDayAllowed("2026-02-31", now));
  assert.ok(!isVisitDayAllowed("tomorrow", now));
});

test("the visit notification says it is a site visit, in both languages", () => {
  const params = { name: "Omar", kind: "visit" as const };
  const quoteParams = { name: "Omar", kind: "quote" as const };

  assert.match(renderEmail("inquiry_received", "en", params).subject, /site visit/i);
  assert.match(renderEmail("inquiry_received", "ar", params).text, /زيارة/);
  assert.doesNotMatch(renderEmail("inquiry_received", "en", quoteParams).text, /site visit/i);
});
