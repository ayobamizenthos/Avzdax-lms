const ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (ID_PATTERN.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.replace(/^www\./, "") === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return ID_PATTERN.test(id) ? id : null;
    }
    const v = url.searchParams.get("v");
    if (v && ID_PATTERN.test(v)) return v;
    const pathMatch = url.pathname.match(
      /\/(embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/
    );
    if (pathMatch) return pathMatch[2];
  } catch {
    return null;
  }
  return null;
}
