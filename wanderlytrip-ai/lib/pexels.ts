/**
 * Pexels API client for fetching travel photos.
 * Server-side only — uses PEXELS_API_KEY (not exposed to browser).
 */

export interface PexelsPhoto {
  id: number;
  url: string;         // Pexels page URL
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
  photographer: string;
  photographerUrl: string;
  width: number;
  height: number;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
}

/**
 * Fetch travel photos for a destination from Pexels.
 * Falls back to an empty array if the API key is missing or the request fails.
 *
 * @param destination - Search query, e.g. "Tokyo Japan travel"
 * @param count       - Number of photos to return (max 80 per Pexels page)
 */
export async function getTravelImages(
  destination: string,
  count: number = 6
): Promise<PexelsPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const query = encodeURIComponent(`${destination} travel`);
  const perPage = Math.min(count, 80);

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}&orientation=landscape`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 86400 }, // cache 24 h
      }
    );

    if (!res.ok) throw new Error(`Pexels error: ${res.status}`);

    const data: PexelsSearchResponse = await res.json();
    return data.photos ?? [];
  } catch {
    return [];
  }
}

/**
 * Get a single photo URL for a destination.
 * Returns null if no photos are found.
 *
 * @param destination - Search query
 * @param seed        - Index offset for variety (use day index, activity index, etc.)
 * @param size        - Image size variant
 */
export async function getTravelImageUrl(
  destination: string,
  seed: number = 0,
  size: keyof PexelsPhoto["src"] = "large"
): Promise<string | null> {
  const photos = await getTravelImages(destination, 15);
  if (!photos.length) return null;
  return photos[seed % photos.length].src[size];
}
