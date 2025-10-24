type CacheEntry = {
  body: any;
  etag: string;
  expiresAt: number;
};

const store = new Map<string, CacheEntry>();

export function putCache(key: string, body: any, ttlMs: number) {
  const etag = `"gpf-${Buffer.from(JSON.stringify(body)).toString("base64").slice(0, 16)}"`;
  store.set(key, {
    body,
    etag,
    expiresAt: Date.now() + ttlMs
  });
  return { etag };
}

export function getCache(key: string): CacheEntry | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }
  return hit;
}

export function invalidateCache(pattern?: string) {
  if (!pattern) {
    store.clear();
    return;
  }
  const keys = Array.from(store.keys());
  for (const key of keys) {
    if (key.includes(pattern)) {
      store.delete(key);
    }
  }
}
