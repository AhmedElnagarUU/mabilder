import { z } from "zod";
import {
  getBlockDefinition,
  type Block,
  type BlockType,
} from "../../static-site-generator/blocks/catalog";
import { linkSchema, type Link } from "../../static-site-generator/blocks/common";

export type Props = Record<string, unknown>;

export type WrittenProps =
  | { ok: true; props: Props }
  | { ok: false; issues: string[] };

type ObjectSchema = z.ZodObject<z.ZodRawShape>;

// Images come from the customer or Pexels; link targets come from composition, so the AI
// writes only the label of links that already exist. Fact blocks: only their headings.
const imageKeys = ["image", "images"];
const linkKeys = ["primary", "secondary", "link"];
const factCopyKeys = ["eyebrow", "title", "body"];

function requireDefinition(type: BlockType) {
  const definition = getBlockDefinition(type);

  if (!definition) {
    throw new Error(`Unknown block type "${type}".`);
  }

  return definition;
}

function catalogSchema(type: BlockType): ObjectSchema {
  return requireDefinition(type).schema as unknown as ObjectSchema;
}

export function isCopyBlock(block: Block): boolean {
  return requireDefinition(block.type).kind === "copy";
}

function isWritableKey(type: BlockType, key: string, current: Props): boolean {
  if (imageKeys.includes(key)) {
    return false;
  }

  if (linkKeys.includes(key)) {
    return current[key] !== undefined;
  }

  return requireDefinition(type).kind === "copy" || factCopyKeys.includes(key);
}

export function writableKeys(type: BlockType, current: Props): string[] {
  return Object.keys(catalogSchema(type).shape).filter((key) =>
    isWritableKey(type, key, current),
  );
}

// The catalog schema of the fields the AI writes for this block (with all its limits).
export function writableSchema(type: BlockType, current: Props): ObjectSchema {
  const keys = writableKeys(type, current);
  const textKeys = keys.filter((key) => !linkKeys.includes(key));
  const links = keys.filter((key) => linkKeys.includes(key));

  return catalogSchema(type)
    .pick(Object.fromEntries(textKeys.map((key) => [key, true])) as Record<string, true>)
    .extend(Object.fromEntries(links.map((key) => [key, linkSchema.pick({ label: true })])));
}

// The current text the AI sees: only writable fields, links reduced to their label.
export function writableFields(type: BlockType, props: Props): Props {
  return Object.fromEntries(
    writableKeys(type, props)
      .filter((key) => props[key] !== undefined)
      .map((key) =>
        linkKeys.includes(key) ? [key, { label: (props[key] as Link).label }] : [key, props[key]],
      ),
  );
}

// Strict structured output: every property is required and limits like minLength or
// maxItems are not supported by every provider. So optional text becomes "" (removed
// again by stripEmpty) and limits are checked afterwards by the catalog schema.
function toModelField(field: z.ZodType): z.ZodType {
  if (field instanceof z.ZodOptional) {
    if (!(field.unwrap() instanceof z.ZodString)) {
      throw new Error("Only optional text fields can be written by AI.");
    }

    return z.string().describe("Optional. Use an empty string to leave it out.");
  }

  return toModelSchema(field);
}

export function toModelSchema(schema: z.ZodType): z.ZodType {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>;
    return z.object(
      Object.fromEntries(Object.entries(shape).map(([key, field]) => [key, toModelField(field)])),
    );
  }

  if (schema instanceof z.ZodArray) {
    return z.array(toModelSchema(schema.element as z.ZodType));
  }

  if (schema instanceof z.ZodString) {
    return z.string();
  }

  throw new Error("Unsupported field type for AI output.");
}

// Removes "" and null object fields (left-out optional fields) at every level.
export function stripEmpty(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripEmpty);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== "" && item !== null)
      .map(([key, item]) => [key, stripEmpty(item)]),
  );
}

function writtenLabel(value: unknown): unknown {
  return typeof value === "object" && value !== null
    ? (value as { label?: unknown }).label
    : undefined;
}

// Current props with the writable fields replaced. Everything else (images, link targets,
// fact data) always stays as it was built from the facts.
function mergeWrittenFields(type: BlockType, current: Props, written: Props): Props {
  const keys = writableKeys(type, current);
  const merged: Props = Object.fromEntries(
    Object.entries(current).filter(([key]) => !keys.includes(key)),
  );

  for (const key of keys) {
    if (linkKeys.includes(key)) {
      merged[key] = { label: writtenLabel(written[key]), href: (current[key] as Link).href };
    } else if (written[key] !== undefined) {
      merged[key] = written[key];
    }
  }

  return merged;
}

function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join(".") || "props"}: ${issue.message}`);
}

// Validates one block of AI output with the block's catalog schema.
export function parseWrittenProps(type: BlockType, current: Props, answer: unknown): WrittenProps {
  if (typeof answer !== "object" || answer === null || Array.isArray(answer)) {
    return { ok: false, issues: ["props: missing from the answer"] };
  }

  const merged = mergeWrittenFields(type, current, stripEmpty(answer) as Props);
  const result = catalogSchema(type).safeParse(merged);

  return result.success
    ? { ok: true, props: result.data as Props }
    : { ok: false, issues: formatIssues(result.error) };
}
