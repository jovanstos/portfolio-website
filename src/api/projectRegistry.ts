export const LIVE_PROJECT_IDS = new Set([6, 7, 8, 9, 10]);
export function projectPath(id: number) {
  return `/projects/${LIVE_PROJECT_IDS.has(id) ? "live" : "id"}/${id}`;
}
