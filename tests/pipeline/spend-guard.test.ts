import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildSiteContent,
  generateSiteContent,
} from "../../src/features/site-creation/build-content";
import { setMinIntervalMs } from "../../src/features/site-creation/generation/rate-limit";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { markedAnswer, stubModel, type StubCall } from "./stub-model";

setMinIntervalMs(0);

const thin = businessBriefSchema.parse({
  businessName: "Nour Studio",
  industry: "Interior design",
  description: "A small interior design studio.",
});
const content = buildSiteContent(thin);

function waitForAbort(call: StubCall, fallback: unknown, ms: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    call.signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new Error("aborted"));
    });
  });
}

test("when one page fails for good, the other pages' in-flight calls are aborted and no new calls start", async () => {
  const servicesCalls: StubCall[] = [];
  const stub = stubModel((call) => {
    const answer = markedAnswer(content, "AI");

    if (call.prompt.includes("index-hero-1")) {
      answer.blocks["index-hero-1"].title = "";
      return answer;
    }

    if (call.prompt.includes("services-hero-1")) {
      servicesCalls.push(call);
      return waitForAbort(call, answer, 5_000);
    }

    return answer;
  });

  const started = Date.now();
  await assert.rejects(generateSiteContent(stub.model, thin, null), /index-hero-1/);

  assert.ok(Date.now() - started < 4_000, "the generate waited for a call that should have been aborted");
  assert.equal(servicesCalls.length, 1, "the aborted page made another call");
  assert.ok(servicesCalls[0].signal.aborted);
});

test("a generation never makes more AI calls than its budget (1 profile + 2 per page and language)", async () => {
  const seen = new Set<string>();

  // Every call is rate limited once, so each needs two attempts: 1×2 + 3 pages×2 = 8 > 7.
  function rateLimitedOnce(answer: unknown) {
    return (call: StubCall) => {
      if (!seen.has(call.prompt)) {
        seen.add(call.prompt);
        throw new Error('429 Too Many Requests {"retryDelay": "0s"}');
      }

      return answer;
    };
  }

  const stub = stubModel(
    rateLimitedOnce(markedAnswer(content, "AI")),
    rateLimitedOnce({
      positioning: "A studio.",
      summary: "A studio.",
      services: [],
      differentiators: [],
      tone: "Warm",
      keywords: [],
    }),
  );
  const budget = 1 + content.pages.length * 2;

  await assert.rejects(generateSiteContent(stub.model, thin, null), /budget of 7 calls/);
  assert.equal(stub.calls.length, budget);
});

test("pre-flight: content that fails its schema stops the generate before any AI call", async () => {
  const broken = structuredClone(content);
  (broken.pages[0].blocks[0].props.en as { title: string }).title = "";

  const stub = stubModel(() => markedAnswer(content, "AI"));

  await assert.rejects(generateSiteContent(stub.model, thin, broken), /pre-flight/);
  assert.equal(stub.calls.length, 0);
});
