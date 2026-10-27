export type ContentNode =
  | string
  | ContentNode[]
  | { [key: string]: ContentNode };

export type ContentPath = (string | number)[];

export function isContentObject(
  value: ContentNode,
): value is Record<string, ContentNode> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getAtPath(
  node: ContentNode,
  path: ContentPath,
): ContentNode | undefined {
  let current: ContentNode | undefined = node;

  for (const segment of path) {
    if (current === undefined || typeof current === "string") {
      return undefined;
    }

    current = Array.isArray(current)
      ? current[segment as number]
      : (current as Record<string, ContentNode>)[segment as string];
  }

  return current;
}

export function setAtPath(
  node: ContentNode,
  path: ContentPath,
  value: ContentNode,
): ContentNode {
  if (path.length === 0) {
    return value;
  }

  const [head, ...rest] = path;

  if (Array.isArray(node)) {
    const next = [...node];
    next[head as number] = setAtPath(node[head as number], rest, value);
    return next;
  }

  const record = node as Record<string, ContentNode>;
  return {
    ...record,
    [head as string]: setAtPath(record[head as string], rest, value),
  };
}

export function blankValue(value: ContentNode, key = ""): ContentNode {
  if (typeof value === "string") {
    if (key === "variant") {
      return "dark";
    }

    if (key === "src") {
      return "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80";
    }

    if (key.toLowerCase().endsWith("href")) {
      return "#";
    }

    return "";
  }

  if (Array.isArray(value)) {
    return [];
  }

  return Object.fromEntries(
    Object.entries(value).map(([childKey, child]) => [
      childKey,
      blankValue(child, childKey),
    ]),
  );
}
