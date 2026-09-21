import { generateKeyBetween } from "fractional-indexing";

/** Position for a new last item among `existingPositions` (siblings), sorted or not. */
export function positionAtEnd(existingPositions: string[]): string {
  if (existingPositions.length === 0) return generateKeyBetween(null, null);
  const max = existingPositions.reduce((a, b) => (a > b ? a : b));
  return generateKeyBetween(max, null);
}

export { generateKeyBetween };
