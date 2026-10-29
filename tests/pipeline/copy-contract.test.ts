import assert from "node:assert/strict";
import { test } from "node:test";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { buildOutputSchema, writeCopy } from "../../src/features/site-creation/generation/copy";
import {
  parseWrittenProps,
  writableFields,
  writableKeys,
} from "../../src/features/site-creation/generation/copy-fields";
import { setMinIntervalMs } from "../../src/features/site-creation/generation/rate-limit";
import { createSpendGuard } from "../../src/features/site-creation/generation/spend-guard";
import {
  blockDefinitions,
  type Block,
  type BlockType,
} from "../../src/features/static-site-generator/blocks/catalog";
import type { Locale } from "../../src/features/static-site-generator/locale";

// If the schema we send to the model and the validation we apply to its answer ever
// disagree, these tests fail before any token is spent. No AI and no network.

setMinIntervalMs(0);

type Definition = (typeof blockDefinitions)[number];
type Props = Record<string, unknown>;
type FixtureName = "full" | "minimal";
type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: unknown;
};

const fixtureNames: FixtureName[] = ["full", "minimal"];
const locales: Locale[] = ["en", "ar"];

function fixtureOf(definition: Definition, name: FixtureName): Props {
  return definition.fixtures[name] as Props;
}

function blockFor(definition: Definition, props: Props, locale: Locale): Block {
  return {
    id: `${definition.type}-block`,
    type: definition.type,
    variant: definition.variants[0],
    hidden: false,
    props: { [locale]: props },
  } as Block;
}

function sentBlockSchema(block: Block, locale: Locale): z.ZodType {
  const sent = buildOutputSchema([{ block, current: {} }], locale) as unknown as z.ZodObject<{
    blocks: z.ZodObject<Record<string, z.ZodType>>;
  }>;
  return sent.shape.blocks.shape[block.id];
}

// The answer a strict model gives: every field present, left-out optional text as "".
function completeAnswer(schema: z.ZodType, value: unknown): unknown {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>;
    return Object.fromEntries(
      Object.entries(shape).map(([key, field]) => [
        key,
        completeAnswer(field, (value as Props | undefined)?.[key]),
      ]),
    );
  }

  if (schema instanceof z.ZodArray) {
    return ((value as unknown[] | undefined) ?? []).map((item) =>
      completeAnswer(schema.element as z.ZodType, item),
    );
  }

  return value ?? "";
}

function toArabic(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value), (_key, item) =>
    typeof item === "string" && item !== "" ? `نص عربي ${item.length}` : item,
  );
}

function answerFor(block: Block, definition: Definition, props: Props, locale: Locale): unknown {
  const answer = completeAnswer(
    sentBlockSchema(block, locale),
    writableFields(definition.type, props),
  );
  return locale === "ar" ? toArabic(answer) : answer;
}

for (const definition of blockDefinitions) {
  for (const name of fixtureNames) {
    for (const locale of locales) {
      test(`contract: ${definition.type} ${name} ${locale} — sent schema accepts the answer, validation accepts it, the block passes the catalog`, () => {
        const props = fixtureOf(definition, name);
        const block = blockFor(definition, props, locale);
        const answer = answerFor(block, definition, props, locale);

        const sent = buildOutputSchema([{ block, current: {} }], locale);
        const accepted = sent.safeParse({ blocks: { [block.id]: answer } });
        assert.ok(accepted.success, JSON.stringify(accepted.error?.issues));

        const result = parseWrittenProps(definition.type as BlockType, props, answer);
        assert.ok(result.ok, result.ok ? "" : result.issues.join("; "));

        const catalog = definition.schema as z.ZodType;
        assert.ok(catalog.safeParse(result.props).success);

        if (locale === "en") {
          assert.deepEqual(result.props, catalog.parse(props), "the fixture does not round-trip");
        }
      });
    }
  }
}

function fakeOpenRouter(bodies: Props[], answer: unknown): typeof fetch {
  return (async (_url: unknown, init?: { body?: unknown }) => {
    bodies.push(JSON.parse(String(init?.body)) as Props);

    return new Response(
      JSON.stringify({
        id: "offline",
        object: "chat.completion",
        created: 0,
        model: "offline",
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: { role: "assistant", content: JSON.stringify(answer), refusal: null },
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;
}

for (const name of fixtureNames) {
  test(`offline request (${name} fixtures): LangChain sends a strict json_schema with every block's full writable schema`, async () => {
    const blocks = blockDefinitions.map((definition) =>
      blockFor(definition, fixtureOf(definition, name), "en"),
    );
    const answer = {
      blocks: Object.fromEntries(
        blocks.map((block, index) => [
          block.id,
          answerFor(block, blockDefinitions[index], fixtureOf(blockDefinitions[index], name), "en"),
        ]),
      ),
    };
    const bodies: Props[] = [];
    const model = new ChatOpenAI({
      apiKey: "offline",
      model: "anthropic/claude-haiku-5.5",
      configuration: { baseURL: "http://offline.invalid/v1", fetch: fakeOpenRouter(bodies, answer) },
      maxRetries: 0,
    });

    const written = await writeCopy(
      model,
      { name: "page_copy", system: "system", buildPrompt: () => "prompt" },
      blocks.map((block) => ({ block, current: {} })),
      "en",
      createSpendGuard(2),
    );

    assert.equal(bodies.length, 1);
    const format = bodies[0].response_format as {
      type: string;
      json_schema: { strict: boolean; schema: JsonSchema };
    };
    assert.equal(format.type, "json_schema");
    assert.equal(format.json_schema.strict, true);
    assert.doesNotMatch(JSON.stringify(format.json_schema.schema), /\$ref/);

    const sentBlocks = format.json_schema.schema.properties?.blocks;
    assert.deepEqual(sentBlocks?.required?.sort(), blocks.map((block) => block.id).sort());

    for (const [index, block] of blocks.entries()) {
      const props = fixtureOf(blockDefinitions[index], name);
      const keys = writableKeys(block.type, props).sort();
      const schema: JsonSchema | undefined = sentBlocks?.properties?.[block.id];

      assert.ok(keys.length > 0, `${block.type} has no writable fields`);
      assert.equal(schema?.type, "object", block.type);
      assert.deepEqual(Object.keys(schema?.properties ?? {}).sort(), keys, block.type);
      assert.deepEqual(schema?.required?.sort(), keys, block.type);
      assert.equal(schema?.additionalProperties, false, block.type);
      assert.deepEqual(written.get(block.id), (blockDefinitions[index].schema as z.ZodType).parse(props));
    }
  });
}
