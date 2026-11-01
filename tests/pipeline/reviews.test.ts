import assert from "node:assert/strict";
import { test } from "node:test";
import { generateSiteContent } from "../../src/features/site-creation/build-content";
import { composeSite } from "../../src/features/site-creation/composition/compose";
import { buildFacts } from "../../src/features/site-creation/facts";
import { setMinIntervalMs } from "../../src/features/site-creation/generation/rate-limit";
import { refreshFactBlocks } from "../../src/features/site-creation/refresh-facts";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { reviewSchema } from "../../src/features/inquiries/types";
import type { Facts } from "../../src/features/static-site-generator/blocks/facts";
import { contactFormLabels } from "../../src/features/static-site-generator/blocks/contact-options";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import { createSiteRuntime } from "../../src/features/static-site-generator/site-runtime";
import { richBrief, richProjects } from "./samples";
import { markedAnswer, stubModel } from "./stub-model";

setMinIntervalMs(0);

type Review = NonNullable<Facts["reviews"]>[number];

const SITE_ID = "64b000000000000000000002";
const brief = businessBriefSchema.parse(richBrief);

function review(index: number, rating = 5, comment = `Great work number ${index}`): Review {
  return { name: `Client ${index}`, rating, comment };
}

function composeWith(reviews: Review[], locales: ("en" | "ar")[] = ["en"]) {
  return composeSite({
    theme: "agenvo",
    locales,
    defaultLocale: locales[0],
    facts: buildFacts(brief, richProjects, reviews),
    currentYear: 2026,
  });
}

function homeOf(reviews: Review[], file = "index.html"): string {
  process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
  const files = renderSite(composeWith(reviews), "", createSiteRuntime(SITE_ID));
  const found = files.find((candidate) => candidate.fileName === file);
  assert.ok(found, `${file} was not rendered`);
  return found.html;
}

test("the review schema accepts a 1-5 whole rating and a comment up to 600 characters", () => {
  const ok = { name: "Sara", rating: 4, comment: "Lovely work." };

  assert.ok(reviewSchema.safeParse(ok).success);
  assert.ok(reviewSchema.safeParse({ ...ok, rating: "5" }).success, "a radio button sends text");
  assert.ok(reviewSchema.safeParse({ ...ok, comment: "x".repeat(600) }).success);

  for (const rating of [0, 6, 2.5, "abc", -1]) {
    assert.ok(!reviewSchema.safeParse({ ...ok, rating }).success, `rating ${rating}`);
  }

  assert.ok(!reviewSchema.safeParse({ ...ok, comment: "x".repeat(601) }).success);
  assert.ok(!reviewSchema.safeParse({ ...ok, phone: "01001234567" }).success, "no phone for reviews");
});

test("the contact section has a third form: name, five accessible radio stars, a comment and no phone", () => {
  process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
  const html = homeOf([], "contact.html");
  const kindAt = html.indexOf('<input type="hidden" name="kind" value="review"');
  const reviewForm = html.slice(html.lastIndexOf("<form", kindAt), kindAt);

  assert.equal(html.match(/<form data-form/g)?.length, 3);
  assert.equal(html.match(/role="tab"/g)?.length, 3);
  assert.equal(reviewForm.match(/type="radio" name="rating"/g)?.length, 5);
  assert.ok(reviewForm.includes('<legend class="text-xs opacity-70">Your rating</legend>'));
  assert.match(reviewForm, /<textarea name="comment" rows="4" required maxlength="600"/);
  assert.ok(!reviewForm.includes('name="phone"'));
  assert.ok(reviewForm.includes('<option value="corporate-tower">Corporate Tower</option>'));
  assert.ok(html.includes(`>${contactFormLabels.en.reviewTabLabel}</button>`));
});

test("the review form works in Arabic with the fixed Arabic labels", () => {
  process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
  const files = renderSite(composeWith([], ["ar", "en"]), "", createSiteRuntime(SITE_ID));
  const html = files.find((file) => file.fileName === "ar/contact.html")?.html ?? "";

  assert.ok(html.includes(`>${contactFormLabels.ar.reviewTabLabel}</button>`));
  assert.ok(html.includes(contactFormLabels.ar.reviewRatingLabel));
  assert.ok(html.includes(contactFormLabels.ar.reviewCommentPlaceholder));
});

test("without approved reviews the testimonials block keeps today's behaviour: it is not shown", () => {
  const html = homeOf([]);

  assert.ok(!html.includes("testimonials-default"));
});

test("a pending review is never in the facts, so it is not rendered; an approved one is", () => {
  const approved = review(1, 5, "Delivered on time and on budget.");

  assert.ok(!homeOf([]).includes("Delivered on time"));

  const html = homeOf([approved]);
  assert.ok(html.includes("Delivered on time and on budget."));
  assert.ok(html.includes("Client 1"));
  assert.ok(html.includes('aria-label="5 / 5"'));
});

test("HTML in a review comment and name is shown as text", () => {
  const html = homeOf([review(1, 3, '<script>alert("x")</script> <img src=x onerror=alert(1)>')]);

  assert.ok(html.includes("&lt;script&gt;alert("));
  assert.ok(!html.includes("<script>alert("));
  assert.ok(!html.includes("<img src=x"));
});

test("the average stars show only with 3 or more approved reviews", () => {
  const two = homeOf([review(1, 5), review(2, 4)]);
  const three = homeOf([review(1, 5), review(2, 4), review(3, 4)]);

  assert.ok(!two.includes(" / 5 ("));
  assert.ok(three.includes("4.3 / 5 (3)"));
});

test("the home page shows the 6 newest reviews, but the average counts all of them", () => {
  const reviews = Array.from({ length: 8 }, (_, index) => review(index + 1, index < 6 ? 5 : 1));
  const html = homeOf(reviews);

  assert.equal(html.match(/<blockquote class="border-s-2 border-brass ps-8 reveal">/g)?.length, 6);
  assert.ok(html.includes("Great work number 1<"));
  assert.ok(html.includes("Great work number 6<"));
  assert.ok(!html.includes("Great work number 7<"));
  assert.ok(html.includes("4 / 5 (8)"));
});

test("refreshing the fact blocks adds the testimonials block for a first review and drops it when none is left", () => {
  const without = composeWith([]);
  const withReview = refreshFactBlocks(without, brief, richProjects, 2026, [review(1)]);
  const types = (content: typeof without) => content.pages.flatMap((page) => page.blocks.map((block) => block.type));

  assert.ok(!types(without).includes("testimonials"));
  assert.ok(types(withReview).includes("testimonials"));
  assert.deepEqual(withReview.facts.reviews, [review(1)]);

  const removed = refreshFactBlocks(withReview, brief, richProjects, 2026, []);
  assert.ok(!types(removed).includes("testimonials"));
});

test("a project refresh keeps the approved reviews", () => {
  const withReview = composeWith([review(1)]);
  const refreshed = refreshFactBlocks(withReview, brief, richProjects, 2026);

  assert.deepEqual(refreshed.facts.reviews, [review(1)]);
});

test("AI output never touches review text: a model answering other words has no effect", async () => {
  const current = composeWith([review(1, 5, "The customer's own words."), review(2), review(3)]);
  const stub = stubModel(() => markedAnswer(current, "AI"));

  const generated = await generateSiteContent(stub.model, brief, current);
  const testimonialsOf = (content: typeof current) =>
    content.pages.flatMap((page) => page.blocks).find((block) => block.type === "testimonials");
  const before = testimonialsOf(current);
  const after = testimonialsOf(generated);

  assert.ok(before && after && before.type === "testimonials" && after.type === "testimonials");
  assert.deepEqual(generated.facts.reviews, current.facts.reviews);
  assert.deepEqual(after.props.en?.items, before.props.en?.items);
  assert.equal(after.props.en?.items[0].quote, "The customer's own words.");
  assert.equal(after.props.en?.averageRating, before.props.en?.averageRating);
});
