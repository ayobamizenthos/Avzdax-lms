export function parseYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1, 12) || null;
    }
    if (url.searchParams.has("v")) {
      return url.searchParams.get("v");
    }
    const embedMatch = url.pathname.match(/\/(embed|shorts)\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[2];
  } catch {
    return null;
  }
  return null;
}
