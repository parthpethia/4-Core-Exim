/**
 * Tiny in-memory TTL cache for hot catalog metadata (countries, FX, categories).
 * Cuts repeat round-trips while browsing filters.
 */

const store = new Map();

export function cacheGet(key) {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return undefined;
  }
  return hit.value;
}

export function cacheSet(key, value, ttlMs = 60_000) {
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export async function cacheGetOrSet(key, loader, ttlMs = 60_000) {
  const existing = cacheGet(key);
  if (existing !== undefined) return existing;
  const value = await loader();
  return cacheSet(key, value, ttlMs);
}

export function cacheInvalidate(prefix = '') {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
