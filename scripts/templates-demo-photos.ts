import { writeFile } from "node:fs/promises";
import path from "node:path";
import { searchPhotos } from "../src/features/site-creation/images/pexels";
import { photoSlots } from "../src/features/templates-gallery/demo/photo-slots";

// Dev only: searches Pexels once for the demo gallery's image needs and writes the photo URLs +
// photographer credits into src/features/templates-gallery/demo/photos.json. Run with PEXELS_API_KEY
// in the environment (npm supplies it from .env via node --env-file). The app never calls Pexels.
async function main(): Promise<void> {
  const photos: Record<string, { src: string; credit: { name: string; url: string } }> = {};

  for (const slot of photoSlots) {
    const results = await searchPhotos(slot.query, 6);
    const photo = results[0];

    if (!photo) {
      console.error(`No Pexels result for slot "${slot.key}" (query: ${slot.query}).`);
      process.exitCode = 1;
      return;
    }

    photos[slot.key] = {
      src: photo.src[slot.size],
      credit: { name: photo.photographer, url: photo.url },
    };
    console.log(`${slot.key}: ${photo.src[slot.size]} — ${photo.photographer}`);
  }

  const target = path.join(
    process.cwd(),
    "src",
    "features",
    "templates-gallery",
    "demo",
    "photos.json",
  );

  await writeFile(target, JSON.stringify({ generatedAt: new Date().toISOString(), photos }, null, 2));
  console.log(`Wrote ${target} (${Object.keys(photos).length} photos).`);
}

void main();
