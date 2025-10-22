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