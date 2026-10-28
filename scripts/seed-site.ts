import { readFile } from "node:fs/promises";
import { generateSite } from "../src/features/static-site-generator/generate-site";
import {
  getContentFilePath,
  getPreviewPath,
} from "../src/features/static-site-generator/site-paths";
import { upsertSeedSite } from "../src/features/site-creation/repository";
import { disconnectFromDatabase } from "../src/shared/db/mongoose";

const brief = {
  businessName: "Agenvo",
  industry: "Architecture, engineering and interiors",
  description:
    "Agenvo is an architecture, engineering and interiors practice working with clients who build for the long term.",
  services:
    "Architecture\nStructural engineering\nInterior architecture\nMasterplanning\nAdvisory",
  audience: "Private clients, developers, and institutions",
  location: "Zurich, Switzerland",
  tone: "Refined, calm, and confident",
  email: "hello@agenvo.com",
  phone: "+41 44 123 4567",
  website: "https://agenvo.com",
  yearsInBusiness: "20",
  awards: "",
  notableClients: "",
  projectCount: "",
  extraDetails: "",
};

async function main(): Promise<void> {
  const ownerId = process.argv[2];

  if (!ownerId) {
    throw new Error("Usage: npm run seed:site -- <userId>");
  }

  const content: unknown = JSON.parse(
    await readFile(getContentFilePath(), "utf8"),
  );
  const site = await upsertSeedSite(ownerId, "agenvo", brief, content);

  if (!site.content) {
    throw new Error("The seeded site has no content.");
  }

  await generateSite(site.id, site.content);

  console.log(`Seeded ${site.businessName}.`);
  console.log(`Editor: /edit/${site.id}`);
  console.log(`Preview: ${getPreviewPath(site.id)}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => disconnectFromDatabase());
