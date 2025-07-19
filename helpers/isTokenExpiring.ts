export function isTokenExpiringSoon(
  expiresAt: Date,
  bufferMinutes: number = 5
): boolean {
  const now = new Date();
  const bufferTime = bufferMinutes * 60 * 1000;
  return expiresAt.getTime() - now.getTime() < bufferTime;
}
