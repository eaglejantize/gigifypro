export async function trackCta(name: string) {
  try {
    await fetch("/api/track/cta-click", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, path: location.pathname })
    });
  } catch {
    // No-op: tracking failures should not break user experience
  }
}
