import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { decodeTokenForDisplay } from '../../auth/oidcClient';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';

/**
 * Persistent auth status bar: shows who's signed in, their verified roles,
 * and (for this demo's transparency) the actual decoded JWT claims so the
 * signature-verification + RBAC story is visible, not just asserted.
 */
export const AuthBar: React.FC = () => {
  const { status, claims, accessToken, idToken, logout } = useAuth();
  const [showTokens, setShowTokens] = useState(false);

  if (status !== 'authenticated' || !claims) return null;

  const accessPayload = accessToken ? decodeTokenForDisplay(accessToken) : null;
  const idPayload = idToken ? decodeTokenForDisplay(idToken) : null;

  return (
    <div className="border-b border-gray-200 bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between px-6 py-2 text-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
            ● Signed in via OIDC
          </span>
          <span className="font-medium">{claims.name as string}</span>
          <span className="text-slate-400">{claims.email as string}</span>
          {claims.roles.map((r) => (
            <Badge key={r} color={r === 'admin' ? 'purple' : 'blue'}>{r}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs text-slate-400 hover:text-slate-200 underline"
            onClick={() => setShowTokens((v) => !v)}
          >
            {showTokens ? 'Hide' : 'Inspect'} verified token claims
          </button>
          <Button size="sm" variant="ghost" className="text-slate-200 hover:bg-slate-800" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>

      {showTokens && (
        <div className="grid grid-cols-1 gap-4 border-t border-slate-800 bg-slate-950 px-6 py-4 text-xs sm:grid-cols-2">
          <div>
            <p className="mb-1 font-semibold text-slate-300">Access token claims (RS256-verified)</p>
            <pre className="overflow-x-auto rounded-md bg-black p-3 text-emerald-300">
{JSON.stringify(accessPayload, null, 2)}
            </pre>
          </div>
          <div>
            <p className="mb-1 font-semibold text-slate-300">ID token claims (RS256-verified, nonce-checked)</p>
            <pre className="overflow-x-auto rounded-md bg-black p-3 text-sky-300">
{JSON.stringify(idPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
