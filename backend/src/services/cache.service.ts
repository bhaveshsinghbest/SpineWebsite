// Small in-process cache for public read endpoints. Any admin write clears it, so changes
// made in the admin panel appear on the website immediately.
const store = new Map<string, { at: number; value: unknown }>();
const TTL_MS = 5 * 60_000;

export async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
  const value = await load();
  store.set(key, { at: Date.now(), value });
  return value;
}

export function invalidatePublicCache() {
  store.clear();
}
