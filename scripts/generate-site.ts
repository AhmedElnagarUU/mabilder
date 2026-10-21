import path from "node:path";
import { generateSite } from "../src/features/static-site-generator/generate-site.js";

const outputDirectory = path.join(
  process.cwd(),
  "generated-sites",
  "demo-site",
);

async function main(): Promise<void> {
  await generateSite(outputDirectory);
  console.log(`Generated static site at ${outputDirectory}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
