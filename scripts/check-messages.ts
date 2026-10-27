import fs from "node:fs";
import path from "node:path";

type Messages = { [key: string]: unknown };

function flatten(value: Messages, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (child !== null && typeof child === "object" && !Array.isArray(child)) {
      return flatten(child as Messages, fullKey);
    }

    return [fullKey];
  });
}

function loadMessages(locale: string): Set<string> {
  const file = path.join(process.cwd(), "src", "messages", `${locale}.json`);
  const contents = fs.readFileSync(file, "utf8");
  return new Set(flatten(JSON.parse(contents) as Messages));
}

const english = loadMessages("en");
const arabic = loadMessages("ar");

const missingInArabic = [...english].filter((key) => !arabic.has(key)).sort();
const missingInEnglish = [...arabic].filter((key) => !english.has(key)).sort();

if (missingInArabic.length > 0) {
  console.error("Missing in ar.json:");
  for (const key of missingInArabic) {
    console.error(`  ${key}`);
  }
}

if (missingInEnglish.length > 0) {
  console.error("Missing in en.json:");
  for (const key of missingInEnglish) {
    console.error(`  ${key}`);
  }
}

if (missingInArabic.length > 0 || missingInEnglish.length > 0) {
  process.exit(1);
}

console.log(`Messages are in sync (${english.size} keys).`);
