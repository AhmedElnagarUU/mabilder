import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { getTour, tours } from "../../src/features/onboarding/tours";

type Messages = Record<string, unknown>;

function loadMessages(locale: string): Messages {
  const file = join(process.cwd(), "src", "messages", `${locale}.json`);
  return JSON.parse(readFileSync(file, "utf8")) as Messages;
}

function lookup(messages: Messages, key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => {
    return typeof node === "object" && node !== null ? (node as Messages)[part] : undefined;
  }, messages.onboarding);
}

test("every tour step has its title and body in English and Arabic", () => {
  for (const locale of ["en", "ar"]) {
    const messages = loadMessages(locale);

    for (const tour of tours) {
      for (const step of tour.steps) {
        for (const key of [step.titleKey, step.bodyKey]) {
          const text = lookup(messages, key);
          assert.ok(
            typeof text === "string" && text.trim().length > 0,
            `${locale}: missing onboarding.${key} (tour ${tour.id})`,
          );
        }
      }
    }
  }
});

test("the tour window texts exist in English and Arabic", () => {
  for (const locale of ["en", "ar"]) {
    const messages = loadMessages(locale);

    for (const key of ["counter", "skip", "back", "next", "done", "help"]) {
      assert.equal(typeof lookup(messages, `ui.${key}`), "string", `${locale}: ui.${key}`);
    }
  }
});

test("tour ids are unique, each tour has 3 to 5 steps and unique targets", () => {
  const ids = tours.map((tour) => tour.id);
  assert.deepEqual(new Set(ids).size, ids.length);
  assert.deepEqual([...ids].sort(), ["dashboard", "editor", "projects", "seo", "tracking"]);

  const allTargets: string[] = [];

  for (const tour of tours) {
    assert.ok(tour.steps.length >= 3 && tour.steps.length <= 5, `${tour.id} step count`);
    allTargets.push(...tour.steps.map((step) => step.target));
  }

  assert.equal(new Set(allTargets).size, allTargets.length);
});

test("getTour returns the tour for an id and rejects unknown ids", () => {
  assert.equal(getTour("seo").id, "seo");
  assert.throws(() => getTour("nope" as never));
});
