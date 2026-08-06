const SAFE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateInviteCode(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => SAFE_CHARS[b % SAFE_CHARS.length])
    .join("");
}
