import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { searchPhotos } from "../src/features/site-creation/images/pexels";
import {
  photoQueries,
  photoSetIds,
  photoSlots,
  type PhotoSetId,
} from "../src/features/templates-gallery/demo/photo-slots";

// Dev only: fills src/features/templates-gallery/demo/photos.json with one photo set per template
// (own Pexels queries per template mood, no photo repeated across sets — dedupe by Pexels photo
// id, the next result is taken instead). Run with PEXELS_API_KEY in the environment (npm supplies
// it from .env via node --env-file). The app itself never calls Pexels.
//   npm run templates:demo-photos            fill every set that is not saved yet, keep the rest
//   npm run templates:demo-photos -- nova    (re)fill only nova's set, keep the others
type PhotoRecord = { src: string; credit: { name: string; url: string } };
type PhotoSets = Record<string, Record<string, PhotoRecord | undefined>>;

const target = path.join(
  process.cwd(),
  "src",
  "features",
  "templates-gallery",
  "demo",
  "photos.json",
);

// Pexels photo ids live in the src URL (/photos/<id>/pexels-photo-<id>...), so already saved sets
// can be checked for duplicates without knowing their ids.
function photoIdOf(src: string): string | null {
  const match = /\/photos\/(\d+)\//.exec(src);

  return match?.[1] ?? null;
}

async function main(): Promise<void> {
  const only = process.argv[2];

  if (only !== undefined && !photoSetIds.includes(only as PhotoSetId)) {
    console.error(`Unknown template id "${only}". Choose one of: ${photoSetIds.join(", ")}.`);
    process.exitCode = 1;
    return;
  }

  const sets: PhotoSets = {};

  try {
    Object.assign(sets, (JSON.parse(await readFile(target, "utf8")) as { sets?: PhotoSets }).sets);
  } catch {
    // No saved file yet: every set is filled from scratch.
  }

  const replacementIds = new Set<string>(only !== undefined ? [only] : []);

  // Ids used by the kept sets are blocked; the set being replaced may freely reuse its own photos.
  const usedIds = new Set<string>();

  for (const id of photoSetIds) {
    if (replacementIds.has(id)) {
      continue;
    }

    for (const photo of Object.values(sets[id] ?? {})) {
      if (photo) {
        const photoId = photoIdOf(photo.src);

        if (photoId) {
          usedIds.add(photoId);
        }
      }
    }
  }

  for (const id of photoSetIds) {
    if (only !== undefined ? id !== only : sets[id]) {
      if (only === undefined) {
        console.log(`Set "${id}" already saved (${Object.keys(sets[id]).length} photos); keeping it.`);
      }

      continue;
    }

    const photos = await fillSet(id, usedIds);

    if (!photos) {
      console.error("Nothing written; photos.json keeps its current content.");
      process.exitCode = 1;
      return;
    }

    sets[id] = photos;
  }

  const orderedSets: PhotoSets = {};

  for (const id of photoSetIds) {
    orderedSets[id] = sets[id] ?? {};
  }

  // Sets saved under other ids (e.g. from a newer script version) are kept as they are.
  for (const id of Object.keys(sets)) {
    if (!(id in orderedSets)) {
      orderedSets[id] = sets[id];
    }
  }

  const duplicates = new Set<string>();

  for (const id of photoSetIds) {
    for (const [slot, photo] of Object.entries(orderedSets[id])) {
      if (!photo) {
        continue;
      }

      const photoId = photoIdOf(photo.src);

      if (photoId && duplicates.has(photoId)) {
        console.error(`Photo ${photoId} appears twice (${id}/${slot}); rerun the script.`);
        process.exitCode = 1;
        return;
      }

      if (photoId) {
        duplicates.add(photoId);
      }
    }
  }

  await writeFile(target, JSON.stringify({ generatedAt: new Date().toISOString(), sets: orderedSets }, null, 2));

  const filled = photoSetIds.filter((id) => Object.keys(orderedSets[id]).length > 0);

  console.log(`Wrote ${target} (sets: ${filled.join(", ")}).`);
}

// Returns the complete set for one template, or null when Pexels fails or no unused photo is left.
async function fillSet(
  id: PhotoSetId,
  usedIds: Set<string>,
): Promise<Record<string, PhotoRecord> | null> {
  const queries = photoQueries[id];
  const photos: Record<string, PhotoRecord> = {};

  for (const slot of photoSlots) {
    const query = queries[slot.key];

    try {
      const results = await searchPhotos(query, 6);
      const photo = results.find((candidate) => !usedIds.has(String(candidate.id)));

      if (!photo) {
        console.error(`No unused Pexels result for set "${id}", slot "${slot.key}" (query: ${query}).`);
        return null;
      }

      usedIds.add(String(photo.id));
      photos[slot.key] = {
        src: photo.src[slot.size],
        credit: { name: photo.photographer, url: photo.url },
      };
      console.log(`${id}/${slot.key}: ${photo.src[slot.size]} — ${photo.photographer}`);
    } catch (error) {
      console.error(`Pexels search failed for set "${id}", slot "${slot.key}" (query: ${query}).`);
      console.error(error);
      return null;
    }
  }

  return photos;
}

void main();
