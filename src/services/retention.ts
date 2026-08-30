export const SEVEN_DAY_RETURN_WINDOW_MS = 7 * 24 * 60 * 60 * 1_000;

/** A return is emitted when a later session starts, not when it ends. */
export function isSevenDayReturn(firstSessionStartedAt: number, nextSessionStartedAt: number): boolean {
  return nextSessionStartedAt > firstSessionStartedAt
    && nextSessionStartedAt <= firstSessionStartedAt + SEVEN_DAY_RETURN_WINDOW_MS;
}
