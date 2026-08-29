export type SessionClockInput = {
  startedAt: number;
  durationSeconds: number;
  pausedAt?: number;
  pausedSeconds: number;
  now?: number;
};

export function useSessionClock({ startedAt, durationSeconds, pausedAt, pausedSeconds, now = Date.now() }: SessionClockInput) {
  const elapsedMilliseconds = Math.max(0, (pausedAt ?? now) - startedAt - pausedSeconds * 1000);
  const durationMilliseconds = Math.max(0, durationSeconds * 1000);
  const progress = durationMilliseconds === 0 ? 1 : Math.min(1, elapsedMilliseconds / durationMilliseconds);
  const remainingSeconds = Math.max(0, Math.ceil((durationMilliseconds - elapsedMilliseconds) / 1000));
  return { remainingSeconds, progress, isComplete: remainingSeconds === 0 };
}
