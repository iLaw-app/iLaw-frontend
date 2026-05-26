const store = new Map<string, { data: any; ts: number }>();

export function cacheGet<T>(key: string, ttl = 60_000): T | null {
  const entry = store.get(key);
  if (!entry || Date.now() - entry.ts > ttl) return null;
  return entry.data as T;
}

export function cacheSet(key: string, data: any) {
  store.set(key, { data, ts: Date.now() });
}

export function cacheInvalidate(key: string) {
  store.delete(key);
}

export function cacheInvalidatePrefix(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
