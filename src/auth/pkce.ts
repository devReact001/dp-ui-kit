/**
 * PKCE (Proof Key for Code Exchange, RFC 7636) helpers.
 *
 * dp-ui-kit is a public client (a browser SPA — it cannot keep a client
 * secret confidential, since anything shipped to the browser can be read
 * by the user). PKCE is what lets a public client use the Authorization
 * Code flow safely: instead of a secret, the client proves it's the same
 * party that started the flow by generating a random `code_verifier`,
 * sending only its SHA-256 hash (`code_challenge`) up front, and revealing
 * the original `code_verifier` only at the very end, at the token endpoint,
 * over a direct HTTPS call the authorization server can trust.
 */

function base64UrlEncode(bytes: Uint8Array): string {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** A cryptographically random 43-128 char string, per RFC 7636 §4.1. */
export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** code_challenge = BASE64URL(SHA256(code_verifier)) — the "S256" method. */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

export function generateRandomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}
