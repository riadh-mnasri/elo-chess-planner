// Hashes a password with the Web Crypto API (available both in the Edge
// runtime, where the proxy checks it, and in Node, where the login Server
// Action sets it). Never store the raw password in the auth cookie.
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
