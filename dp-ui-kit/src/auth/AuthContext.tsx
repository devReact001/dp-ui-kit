import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  startLogin as oidcStartLogin,
  handleCallback as oidcHandleCallback,
  refreshTokenSet,
  verifyIdToken,
  logout as oidcLogout,
  type TokenSet,
  type Claims,
} from './oidcClient';

interface AuthState {
  status: 'signed-out' | 'authenticating' | 'authenticated' | 'error';
  claims: Claims | null;
  accessToken: string | null;
  idToken: string | null;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  completeCallback: (search: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Tokens live ONLY in memory (React state), never in localStorage/sessionStorage.
// Rationale for the interview: localStorage is readable by any script on the
// page, so a single XSS bug becomes a full account takeover with a long-lived
// token. Keeping tokens in memory means a page reload logs the user out
// (an accepted trade-off for this demo) and — more importantly — an XSS
// payload can at most steal the CURRENT in-memory token, not exfiltrate a
// persistent credential that keeps working after the tab closes.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'signed-out',
    claims: null,
    accessToken: null,
    idToken: null,
    error: null,
  });
  const refreshTokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const scheduleRefresh = useCallback((tokens: TokenSet) => {
    clearRefreshTimer();
    // Refresh 30s before expiry (access tokens live 5 min in this demo) so a
    // user mid-action never hits a hard 401 from an expired token.
    const delay = Math.max(tokens.expiresAt - Date.now() - 30_000, 5_000);
    // eslint-disable-next-line no-console
    console.log(`[auth] access token expires in ${Math.round((tokens.expiresAt - Date.now()) / 1000)}s — silent refresh scheduled in ${Math.round(delay / 1000)}s`);
    refreshTimerRef.current = window.setTimeout(async () => {
      try {
        // eslint-disable-next-line no-console
        console.log('[auth] silent refresh firing: exchanging refresh_token for a new token set (old refresh_token will be rotated/invalidated by the server)');
        await doRefresh();
        // eslint-disable-next-line no-console
        console.log('[auth] silent refresh succeeded: new access/id tokens applied, new refresh_token stored');
      } catch {
        // eslint-disable-next-line no-console
        console.log('[auth] silent refresh failed — signing out');
        setState({ status: 'signed-out', claims: null, accessToken: null, idToken: null, error: 'Session expired' });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, delay);
  }, []);

  const applyTokens = useCallback(
    async (tokens: TokenSet) => {
      refreshTokenRef.current = tokens.refreshToken;
      // The ID token (not the access token) is what tells the client who's
      // signed in — see the comment on verifyIdToken in oidcClient.ts.
      const claims = await verifyIdToken(tokens.idToken);
      setState({ status: 'authenticated', claims, accessToken: tokens.accessToken, idToken: tokens.idToken, error: null });
      scheduleRefresh(tokens);
    },
    [scheduleRefresh]
  );

  const doRefresh = useCallback(async () => {
    if (!refreshTokenRef.current) throw new Error('No refresh token available');
    const tokens = await refreshTokenSet(refreshTokenRef.current);
    await applyTokens(tokens);
  }, [applyTokens]);

  const login = useCallback(async () => {
    setState((s) => ({ ...s, status: 'authenticating', error: null }));
    const url = await oidcStartLogin();
    window.location.assign(url);
  }, []);

  const completeCallback = useCallback(
    async (search: string) => {
      setState((s) => ({ ...s, status: 'authenticating' }));
      try {
        const tokens = await oidcHandleCallback(new URLSearchParams(search));
        await applyTokens(tokens);
      } catch (err) {
        setState({ status: 'error', claims: null, accessToken: null, idToken: null, error: (err as Error).message });
        throw err;
      }
    },
    [applyTokens]
  );

  const logout = useCallback(async () => {
    clearRefreshTimer();
    await oidcLogout(refreshTokenRef.current);
    refreshTokenRef.current = null;
    setState({ status: 'signed-out', claims: null, accessToken: null, idToken: null, error: null });
  }, []);

  const hasRole = useCallback((role: string) => Boolean(state.claims?.roles?.includes(role)), [state.claims]);

  useEffect(() => clearRefreshTimer, []);

  const value = useMemo(
    () => ({ ...state, login, completeCallback, logout, hasRole }),
    [state, login, completeCallback, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
