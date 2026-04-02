/**
 * Image URL helper — replaces deprecated source.unsplash.com
 * Uses loremflickr.com: free, no API key, topic-relevant photos, deterministic by seed.
 * Swap getImageUrl() here to upgrade to Pexels/Unsplash API without touching components.
 */
export function getImageUrl(query: string, seed: number): string {
  const safe = encodeURIComponent(query.replace(/[^a-zA-Z0-9 ]/g, " ").trim());
  return `https://loremflickr.com/400/300/${safe}?random=${seed}`;
}
