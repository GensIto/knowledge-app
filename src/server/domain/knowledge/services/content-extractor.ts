export function extractTitle(markdown: string, url: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
