import React from 'react';
import { useAuth } from './AuthContext';
import { Card } from '../components/Card/Card';
import { Button } from '../components/Button/Button';
import { Badge } from '../components/Badge/Badge';
import { Spinner } from '../components/Spinner/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, the signed-in user's `roles` claim must include this role. */
  requireRole?: string;
  onNavigate: (page: string) => void;
}

/**
 * RBAC gate. This is deliberately a UI-layer convenience, not the real
 * security boundary — a client-side check can always be bypassed by
 * someone editing JS in devtools. The actual authorization decision is
 * enforced server-side: every API call sends the RS256-signed access
 * token, and the resource server verifies its signature + `roles` claim
 * before returning data. This component just avoids flashing admin UI at
 * a non-admin user and gives a clear, on-brand "access denied" state.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole, onNavigate }) => {
  const { status, claims, hasRole, login } = useAuth();

  if (status === 'authenticating') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Completing sign-in…" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card padding="lg" shadow="md" className="max-w-sm text-center">
          <h2 className="text-lg font-semibold text-gray-900">Sign-in required</h2>
          <p className="mt-2 text-sm text-gray-500">
            This page requires an authenticated session. Sign in with the mock OIDC provider to continue.
          </p>
          <Button className="mt-4" variant="primary" fullWidth onClick={() => login()}>
            Sign in with SSO
          </Button>
        </Card>
      </div>
    );
  }

  if (requireRole && !hasRole(requireRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card padding="lg" shadow="md" className="max-w-sm text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-xl">🚫</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Access denied</h2>
          <p className="mt-2 text-sm text-gray-500">
            Signed in as <span className="font-medium text-gray-700">{claims?.email}</span> with role
            {' '}
            {claims?.roles?.map((r) => (
              <Badge key={r} color="gray" className="mx-0.5">{r}</Badge>
            ))}
            — this page requires the <Badge color="blue">{requireRole}</Badge> role.
          </p>
          <Button className="mt-4" variant="outline" fullWidth onClick={() => onNavigate('dashboard')}>
            Back to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
