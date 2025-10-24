export async function api(path: string, opts: RequestInit = {}) {
  const res = await fetch(path.startsWith("/api") ? path : `/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = typeof data === "string" ? data : data?.error || "Request failed";
    throw new Error(msg);
  }
  return data;
}

const cache = new Map<string, { data: any; etag: string; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute client-side cache

export async function apiGet<T = any>(url: string): Promise<T> {
  const fullUrl = url.startsWith("/api") ? url : `/api${url}`;
  const cacheHit = cache.get(fullUrl);
  const now = Date.now();
  
  // Return fresh cache if available
  if (cacheHit && (now - cacheHit.timestamp) < CACHE_TTL) {
    return cacheHit.data as T;
  }
  
  // Add ETag header if we have a cached version (even if expired)
  const headers: HeadersInit = { credentials: "include" };
  if (cacheHit?.etag) {
    headers["If-None-Match"] = cacheHit.etag;
  }
  
  const response = await fetch(fullUrl, { headers: headers as any });
  
  // 304: Not Modified - reuse cached data and refresh timestamp
  if (response.status === 304 && cacheHit) {
    cache.set(fullUrl, { ...cacheHit, timestamp: now });
    return cacheHit.data as T;
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  const etag = response.headers.get("ETag") || "";
  
  cache.set(fullUrl, { data, etag, timestamp: now });
  return data as T;
}

export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }
  const keys = Array.from(cache.keys());
  for (const key of keys) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}