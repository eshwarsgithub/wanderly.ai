/**
 * Image URL helper — routes through /api/images which proxies Pexels API.
 * Falls back to loremflickr if PEXELS_API_KEY is not set.
 * Swap getImageUrl() here to change image provider without touching any component.
 */
export function getImageUrl(query: string, seed: number): string {
  const safe = encodeURIComponent(query.replace(/[^a-zA-Z0-9 ]/g, " ").trim());
  return `/api/images?query=${safe}&seed=${seed}`;
}
