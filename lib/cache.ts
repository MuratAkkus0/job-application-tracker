/**
 * Central place for cache tag naming so the "use cache" reader
 * (app/dashboard/page.tsx) and the mutation server actions always
 * agree on the tag to invalidate.
 */
export function getBoardCacheTag(userId: string) {
  return `board-${userId}`;
}
