import { z } from "zod";

export type FetchFunction = typeof fetch;

export type PhotoSize = "large2x" | "large" | "medium";

const searchUrl = "https://api.pexels.com/v1/search";
const timeoutMs = 8000;

const photoSchema = z.object({
  id: z.number(),
  url: z.string(),
  photographer: z.string(),
  alt: z.string().nullish(),
  src: z.object({ large2x: z.string(), large: z.string(), medium: z.string() }),
});

const searchResponseSchema = z.object({ photos: z.array(photoSchema) });

export type StockPhoto = z.infer<typeof photoSchema>;

function buildSearchUrl(query: string, count: number): string {
  const params = new URLSearchParams({
    query,
    per_page: String(count),
    orientation: "landscape",
  });

  return `${searchUrl}?${params}`;
}

// Throws when the key is missing, the request fails or times out, or the answer is not a photo list.
export async function searchPhotos(
  query: string,
  count: number,
  fetchFunction: FetchFunction = fetch,
): Promise<StockPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    throw new Error("PEXELS_API_KEY is not set.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFunction(buildSearchUrl(query, count), {
      headers: { Authorization: apiKey },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Pexels search failed with status ${response.status}.`);
    }

    return searchResponseSchema.parse(await response.json()).photos;
  } finally {
    clearTimeout(timer);
  }
}
