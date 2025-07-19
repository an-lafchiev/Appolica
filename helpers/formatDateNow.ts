export function addSecondsToNow(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}
