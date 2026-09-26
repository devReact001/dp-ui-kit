/**
 * Mock OIDC Provider — a minimal but spec-correct OpenID Connect Identity
 * Provider used to demo a real Authorization Code + PKCE flow end-to-end
 * without depending on a live Okta/Auth0/Azure AD tenant.
 *
 * Implements:
 *   GET  /.well-known/openid-configuration   (OIDC discovery document)
 *   GET  /jwks.json                          (public signing key, for token verification)
 *   GET  /authorize                          (renders a login form; starts the Auth Code + PKCE flow)
 *   POST /authorize                          (validates credentials + PKCE params, issues a one-time code)
 *   POST /token                              (authorization_code AND refresh_token grants)
 *   GET  /userinfo                           (SSO-style userinfo endpoint, Bearer access_token)
 *   POST /revoke                             (logout / refresh-token revocation)
 *
 * Security properties this demo deliberately shows, not just claims:
 *   - RS256-signed JWTs (asymmetric — the SPA never sees the private key, only the
 *     published JWKS, so it can verify tokens without being able to forge them).
 *   - PKCE (S256): the SPA never sends a client secret (it's a public client), so
 *     PKCE is what stops an attacker who intercepts the redirect's `code` from
 *     exchanging it for tokens without also knowing the original code_verifier.
 *   - One-time authorization codes with a short TTL.
 *   - Refresh-token rotation: every refresh exchange issues a brand-new refresh
 *     token and immediately invalidates the old one, so a stolen-but-unused
 *     refresh token becomes worthless the next time the legitimate client uses it.
 *
 * THIS IS A DEMO PROVIDER FOR LOCALHOST ONLY. Mock users/passwords below are
 * synthetic seed data for this local demo app — never real credentials.
 */
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';

const PORT = process.env.MOCK_OIDC_PORT || 9000;
const ISSUER = `http://localhost:${PORT}`;

// --- Mock user directory (demo-only, synthetic) --------------------------
const USERS = {
  'alice@dp-ui-kit.dev': {
    password: 'password123',
    sub: 'user_alice',
    name: 'Alice Chen',
    roles: ['admin', 'user'],
  },
  'bob@dp-ui-kit.dev': {
    password: 'password123',
    sub: 'user_bob',
    name: 'Bob Rivera',
    roles: ['user'],
  },
};

// --- Signing key (RS256), generated fresh each server start --------------
const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
const KID = 'demo-key-1';
const publicJwk = { ...(await exportJWK(publicKey)), kid: KID, use: 'sig', alg: 'RS256' };

// --- In-memory stores (demo only — a real IdP uses a database) -----------
const authCodes = new Map();     // code -> { sub, codeChallenge, redirectUri, clientId, nonce, scope, expiresAt }
const refreshTokens = new Map(); // refreshToken -> { sub, clientId, expiresAt }

const CODE_TTL_MS = 60 * 1000;          // authorization codes: 60s, single use
// Access/ID token lifetime is overridable (MOCK_OIDC_ACCESS_TTL, seconds) purely so the
// refresh-rotation flow can be demoed live in seconds instead of waiting 5 minutes —
// production would just use the 5-minute default.
const ACCESS_TOKEN_TTL_S = Number(process.env.MOCK_OIDC_ACCESS_TTL) || 5 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 60 * 1000; // refresh tokens: 30 minutes, rotated on use

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sha256base64url(input) {
  return crypto.createHash('sha256').update(input).digest('base64url');
}

async function signJwt(claims, { expiresInSeconds }) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'RS256', kid: KID })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(privateKey);
}

function issueTokenSet(user, { clientId, nonce, scope }) {
  return Promise.all([
    signJwt(
      { sub: user.sub, scope, roles: user.roles, aud: clientId },
      { expiresInSeconds: ACCESS_TOKEN_TTL_S }
    ),
    signJwt(
      {
        sub: user.sub,
        aud: clientId,
        nonce,
        email: Object.keys(USERS).find((e) => USERS[e].sub === user.sub),
        name: user.name,
        roles: user.roles,
      },
      { expiresInSeconds: ACCESS_TOKEN_TTL_S }
    ),
  ]).then(([accessToken, idToken]) => ({ accessToken, idToken }));
}

function issueRefreshToken(sub, clientId) {
  const token = base64url(crypto.randomBytes(32));
  refreshTokens.set(token, { sub, clientId, expiresAt: Date.now() + REFRESH_TOKEN_TTL_MS });
  return token;
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Discovery -------------------------------------------------------------
app.get('/.well-known/openid-configuration', (_req, res) => {
  res.json({
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/authorize`,
    token_endpoint: `${ISSUER}/token`,
    userinfo_endpoint: `${ISSUER}/userinfo`,
    jwks_uri: `${ISSUER}/jwks.json`,
    revocation_endpoint: `${ISSUER}/revoke`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid', 'profile', 'email'],
  });
});

app.get('/jwks.json', (_req, res) => {
  res.json({ keys: [publicJwk] });
});

// --- Authorization endpoint --------------------------------------------
app.get('/authorize', (req, res) => {
  const { client_id, redirect_uri, state, code_challenge, code_challenge_method, nonce, scope, error } = req.query;

  if (code_challenge_method && code_challenge_method !== 'S256') {
    return res.status(400).send('Only PKCE method S256 is supported by this demo provider.');
  }
  if (!code_challenge) {
    return res.status(400).send('PKCE code_challenge is required — this provider rejects public clients without PKCE.');
  }

  res.set('Content-Type', 'text/html').send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Mock OIDC Provider — Sign in</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
  .card{background:#1e293b;padding:32px;border-radius:12px;width:360px;box-shadow:0 10px 40px rgba(0,0,0,.4)}
  h1{font-size:18px;margin:0 0 4px}
  .badge{display:inline-block;background:#1d4ed8;color:#fff;font-size:11px;padding:2px 8px;border-radius:999px;margin-bottom:16px}
  label{display:block;font-size:13px;margin:12px 0 4px;color:#94a3b8}
  input{width:100%;box-sizing:border-box;padding:8px 10px;border-radius:6px;border:1px solid #334155;background:#0f172a;color:#e2e8f0}
  button{margin-top:20px;width:100%;padding:10px;border:0;border-radius:6px;background:#2563eb;color:#fff;font-weight:600;cursor:pointer}
  .demo-users{margin-top:16px;font-size:12px;color:#64748b;border-top:1px solid #334155;padding-top:12px}
  .err{background:#7f1d1d;color:#fecaca;padding:8px 10px;border-radius:6px;font-size:13px;margin-bottom:12px}
</style></head>
<body>
  <div class="card">
    <span class="badge">MOCK OIDC PROVIDER — localhost:${PORT}</span>
    <h1>Sign in to dp-ui-kit</h1>
    <p style="font-size:13px;color:#94a3b8;margin-top:4px">Authorizing <code>${client_id}</code> · PKCE (S256) verified present</p>
    ${error ? `<div class="err">${error}</div>` : ''}
    <form method="POST" action="/authorize">
      <input type="hidden" name="client_id" value="${client_id ?? ''}">
      <input type="hidden" name="redirect_uri" value="${redirect_uri ?? ''}">
      <input type="hidden" name="state" value="${state ?? ''}">
      <input type="hidden" name="code_challenge" value="${code_challenge ?? ''}">
      <input type="hidden" name="nonce" value="${nonce ?? ''}">
      <input type="hidden" name="scope" value="${scope ?? ''}">
      <label>Email</label>
      <input type="email" name="email" required placeholder="alice@dp-ui-kit.dev">
      <label>Password</label>
      <input type="password" name="password" required placeholder="password123">
      <button type="submit">Sign in &amp; authorize</button>
    </form>
    <div class="demo-users">Demo accounts: <b>alice@dp-ui-kit.dev</b> (admin) / <b>bob@dp-ui-kit.dev</b> (user) — password123</div>
  </div>
</body></html>`);
});

app.post('/authorize', (req, res) => {
  const { email, password, client_id, redirect_uri, state, code_challenge, nonce, scope } = req.body;
  const user = USERS[email];

  if (!user || user.password !== password) {
    const qs = new URLSearchParams({ client_id, redirect_uri, state, code_challenge, nonce, scope, error: 'Invalid email or password' });
    return res.redirect(`/authorize?${qs.toString()}`);
  }

  const code = base64url(crypto.randomBytes(24));
  authCodes.set(code, {
    sub: user.sub,
    codeChallenge: code_challenge,
    redirectUri: redirect_uri,
    clientId: client_id,
    nonce,
    scope,
    expiresAt: Date.now() + CODE_TTL_MS,
  });

  const redirect = new URL(redirect_uri);
  redirect.searchParams.set('code', code);
  if (state) redirect.searchParams.set('state', state);
  res.redirect(redirect.toString());
});

// --- Token endpoint ------------------------------------------------------
app.post('/token', async (req, res) => {
  const { grant_type } = req.body;

  if (grant_type === 'authorization_code') {
    const { code, redirect_uri, client_id, code_verifier } = req.body;
    const entry = authCodes.get(code);

    if (!entry) return res.status(400).json({ error: 'invalid_grant', error_description: 'Unknown or already-used authorization code' });
    authCodes.delete(code); // one-time use, regardless of outcome below

    if (entry.expiresAt < Date.now()) return res.status(400).json({ error: 'invalid_grant', error_description: 'Authorization code expired' });
    if (entry.redirectUri !== redirect_uri || entry.clientId !== client_id) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'redirect_uri/client_id mismatch' });
    }
    if (!code_verifier || sha256base64url(code_verifier) !== entry.codeChallenge) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE verification failed: code_verifier does not match the original code_challenge' });
    }

    const user = Object.values(USERS).find((u) => u.sub === entry.sub);
    const { accessToken, idToken } = await issueTokenSet(user, { clientId: client_id, nonce: entry.nonce, scope: entry.scope });
    const refreshToken = issueRefreshToken(user.sub, client_id);

    return res.json({
      access_token: accessToken,
      id_token: idToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL_S,
      scope: entry.scope,
    });
  }

  if (grant_type === 'refresh_token') {
    const { refresh_token, client_id } = req.body;
    const entry = refreshTokens.get(refresh_token);

    if (!entry || entry.clientId !== client_id) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'Unknown refresh token' });
    }
    refreshTokens.delete(refresh_token); // rotation: old refresh token is dead the instant it's used

    if (entry.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'Refresh token expired' });
    }

    const user = Object.values(USERS).find((u) => u.sub === entry.sub);
    const { accessToken, idToken } = await issueTokenSet(user, { clientId: client_id, nonce: undefined, scope: 'openid profile email' });
    const newRefreshToken = issueRefreshToken(user.sub, client_id);

    return res.json({
      access_token: accessToken,
      id_token: idToken,
      refresh_token: newRefreshToken, // client MUST discard the old one and store this
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL_S,
    });
  }

  res.status(400).json({ error: 'unsupported_grant_type' });
});

// --- Userinfo (SSO-style) -------------------------------------------------
app.get('/userinfo', async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'invalid_token' });

  try {
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, publicKey, { issuer: ISSUER });
    const user = Object.values(USERS).find((u) => u.sub === payload.sub);
    const email = Object.keys(USERS).find((e) => USERS[e].sub === payload.sub);
    res.json({ sub: payload.sub, email, name: user?.name, roles: user?.roles });
  } catch {
    res.status(401).json({ error: 'invalid_token', error_description: 'Access token failed signature/expiry verification' });
  }
});

// --- Logout / revoke -------------------------------------------------------
app.post('/revoke', (req, res) => {
  const { token } = req.body;
  refreshTokens.delete(token);
  res.status(200).json({ revoked: true });
});

app.listen(PORT, () => {
  console.log(`Mock OIDC Provider listening on ${ISSUER}`);
  console.log(`Discovery: ${ISSUER}/.well-known/openid-configuration`);
  console.log(`Demo users: alice@dp-ui-kit.dev / bob@dp-ui-kit.dev  (password123)`);
});
