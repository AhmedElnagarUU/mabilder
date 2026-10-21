import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDemoSiteDirectory } from "./demo-site";

export type GeneratedFile = {
  content: string;
  contentType: string;
};

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

export async function readGeneratedFile(
  segments: string[],
): Promise<GeneratedFile | null> {
  const root = getDemoSiteDirectory();
  const filePath = path.resolve(root, ...segments);

  if (!filePath.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  try {
    return {
      content: await readFile(filePath, "utf8"),
      contentType:
        contentTypes[path.extname(filePath)] ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}
