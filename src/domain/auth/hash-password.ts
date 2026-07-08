// Hashes a password with the Web Crypto API, available both in Node (the
// proxy runs on the Node.js runtime by default in Next.js 16, and Server
// Actions always do) and in browsers. Never store the raw password
// anywhere - only this hash, e.g. in the auth cookie or settings file.
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
