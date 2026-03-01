export function normalizeScenarioId(id: string): string {
  // Convierte en dash/emdash a hyphen normal
  return (id ?? '')
    .replace(/[–—]/g, '-')  // “–” o “—” -> "-"
    .trim();
}
