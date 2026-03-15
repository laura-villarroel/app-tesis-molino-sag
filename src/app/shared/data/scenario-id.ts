export function normalizeScenarioId(id: string): string {
  return String(id ?? '')
    .trim()
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, '')
    .toUpperCase();
}
