/**
 * Thin OIDC client for the mock provider in mock-oidc-server/server.mjs.
 *
 * Implements the Authorization Code flow with PKCE (no client secret — this
 * is a public SPA client) plus refresh-token rotation and RS256 signature
 * verification against the provider's published JWKS.
 */
import { jwtVerify, decodeJwt, createRemoteJWKSet } from 'jose';
import { generateCodeVerifier, generateCodeChallenge, generateRandomState } from './pkce';

export const OIDC_ISSUER = 'http://localhost:9000';
export const CLIENT_ID = 'dp-ui-kit-spa';

const redirectUri = () => `${window.location.origin}/callback`;

// jose caches this fetch internally and re-fetches on kid-miss / TTL expiry —
// exactly what a production RP would do rather than trusting a JWT's own header.
const jwks = createRemoteJWKSet(new URL(`${OIDC_ISSUER}/jwks.json`));

export interface TokenSet {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
}

export interface Claims {
  sub: string;
  email?: string;
  name?: string;
  roles: string[];
  [key: string]: unknown;
}

const PKCE_STORAGE_KEY = 'dp-ui-kit.oidc.pkce';

/** Step 1: build the /authorize redirect URL and stash PKCE + state/nonce for the callback. */
export async function startLogin(): Promise<string> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomState();
  const nonce = generateRandomState();

  // sessionStorage (not localStorage): scoped to this tab, cleared when the
  // tab closes — the verifier only needs to survive the redirect round-trip.
  sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify({ codeVerifier, state, nonce }));

  const url = new URL(`${OIDC_ISSUER}/authorize`);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', nonce);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

/** Step 2: on /callback, exchange the `code` for tokens — verifying `state` first. */
export async function handleCallback(searchParams: URLSearchParams): Promise<TokenSet> {
  const code = searchParams.get('code');
  const returnedState = searchParams.get('state');
  const errorParam = searchParams.get('error');

  if (errorParam) throw new Error(`Authorization failed: ${errorParam}`);
  if (!code) throw new Error('No authorization code in callback URL');

  const stored = sessionStorage.getItem(PKCE_STORAGE_KEY);
  if (!stored) throw new Error('No PKCE session found — login may have started in a different tab');
  const { codeVerifier, state, nonce } = JSON.parse(stored);
  sessionStorage.removeItem(PKCE_STORAGE_KEY);

  // CSRF defense: the state we get back must match the one we generated —
  // otherwise this could be an attacker's authorization response being
  // injected into our callback (a "login CSRF" / session-fixation attack).
  if (returnedState !== state) {
    throw new Error('state mismatch — possible CSRF attempt, aborting token exchange');
  }

  const res = await fetch(`${OIDC_ISSUER}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error_description || 'Token exchange failed');
  }

  const body = await res.json();

  // Verify the ID token's signature + issuer/audience/expiry against the
  // provider's published JWKS before trusting ANY claim in it — and check
  // the nonce to bind this token to the specific login attempt we started.
  const idClaims = await verifyIdToken(body.id_token);
  if (idClaims.nonce !== nonce) {
    throw new Error('ID token nonce mismatch — token was not issued for this login attempt');
  }

  return {
    accessToken: body.access_token,
    idToken: body.id_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  };
}

/** Silent refresh — rotates the refresh token, matching the server's rotation policy. */
export async function refreshTokenSet(refreshToken: string): Promise<TokenSet> {
  const res = await fetch(`${OIDC_ISSUER}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });
  if (!res.ok) throw new Error('Refresh failed — session expired, user must sign in again');
  const body = await res.json();
  return {
    accessToken: body.access_token,
    idToken: body.id_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  };
}

/**
 * Verifies an access token's RS256 signature against the JWKS and returns its
 * claims. In this demo the access token carries `roles` too (a resource
 * server would check this before serving an API request) — but it does NOT
 * carry the user's name/email, deliberately: an access token is meant to be
 * sent to resource servers/APIs, so OAuth2 best practice is to keep it
 * scoped to what authorization decisions need, not the user's PII.
 */
export async function verifyAccessToken(accessToken: string): Promise<Claims> {
  const { payload } = await jwtVerify(accessToken, jwks, { issuer: OIDC_ISSUER, audience: CLIENT_ID });
  return payload as unknown as Claims;
}

/**
 * Verifies the ID token's RS256 signature against the JWKS and returns its
 * claims. The ID token is OIDC's actual contribution on top of plain OAuth2:
 * it's the client's own proof of "who is signed in" (sub, email, name,
 * roles) — never sent to a resource server, only consumed by this app to
 * render the signed-in UI and drive client-side RBAC.
 */
export async function verifyIdToken(idToken: string): Promise<Claims> {
  const { payload } = await jwtVerify(idToken, jwks, { issuer: OIDC_ISSUER, audience: CLIENT_ID });
  return payload as unknown as Claims;
}

/** Unverified decode, for display purposes only (e.g. showing token contents in the UI). */
export function decodeTokenForDisplay(token: string) {
  return decodeJwt(token);
}

export async function fetchUserinfo(accessToken: string) {
  const res = await fetch(`${OIDC_ISSUER}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('userinfo request failed');
  return res.json();
}

export async function logout(refreshToken: string | null) {
  if (refreshToken) {
    await fetch(`${OIDC_ISSUER}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: refreshToken }),
    }).catch(() => {}); // best-effort — logout should not get stuck if the IdP is unreachable
  }
}
