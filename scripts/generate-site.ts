import path from "node:path";
import { generateSite } from "../src/features/static-site-generator/generate-site";

const outputDirectory = path.join(
  process.cwd(),
  "generated-sites",
  "demo-site",
);

async function main(): Promise<void> {
  await generateSite(outputDirectory);
  console.log(`Generated static site at ${outputDirectory}`);
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error);
    process.exit(1);
  },
);
