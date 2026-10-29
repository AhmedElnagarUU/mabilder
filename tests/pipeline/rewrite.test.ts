import assert from "node:assert/strict";
import { test } from "node:test";
import { rewriteBlocks } from "../../src/features/site-creation/generation/page-copy";
import { setMinIntervalMs } from "../../src/features/site-creation/generation/rate-limit";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { composeFor, richBrief, richProjects } from "./samples";
import { markedAnswer, stubModel } from "./stub-model";

setMinIntervalMs(0);

const background = { brief: businessBriefSchema.parse(richBrief) };

test("rewriteBlocks changes only the requested copy blocks; requested fact blocks are ignored (features v2 C1)", async () => {
  const content = composeFor(richBrief, richProjects);
  const stub = stubModel(() => markedAnswer(content, "AI"));
  const requested = ["index-hero-1", "index-stats-1", "index-cta-1"];
  const instruction = "Make it warmer and shorter.";

  const rewritten = await rewriteBlocks(
    stub.model,
    content,
    { pageId: "index", blockIds: requested, instruction },
    background,
  );

  assert.equal(stub.calls.length, 1);
  assert.ok(stub.calls[0].prompt.includes(instruction), "the instruction is not in the prompt");
  const heroTitle = (content.pages[0].blocks[0].props.en as { title: string }).title;
  assert.ok(stub.calls[0].prompt.includes(heroTitle), "the current text is not in the prompt");

  assert.deepEqual(rewritten.facts, content.facts);

  for (const [pageIndex, page] of content.pages.entries()) {
    for (const [blockIndex, block] of page.blocks.entries()) {
      const after = rewritten.pages[pageIndex].blocks[blockIndex];
      const changed = ["index-hero-1", "index-cta-1"].includes(block.id);

      if (changed) {
        assert.match(JSON.stringify(after.props), new RegExp(`AI:${block.id}:`));
        assert.deepEqual({ ...after, props: null }, { ...block, props: null });
      } else {
        assert.deepEqual(after, block, `${block.id} changed`);
      }
    }
  }
});

test("rewriteBlocks with only fact block ids makes no AI call and changes nothing", async () => {
  const content = composeFor(richBrief, richProjects);
  const stub = stubModel(() => markedAnswer(content, "AI"));

  const rewritten = await rewriteBlocks(
    stub.model,
    content,
    { pageId: "index", blockIds: ["index-stats-1", "index-projects-1"] },
    background,
  );

  assert.equal(stub.calls.length, 0);
  assert.deepEqual(rewritten, content);
});
