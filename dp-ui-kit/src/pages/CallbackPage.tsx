import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Spinner } from '../components/Spinner/Spinner';
import { Card } from '../components/Card/Card';
import { Button } from '../components/Button/Button';

interface CallbackPageProps {
  onNavigate: (page: string) => void;
}

/**
 * Landing page for the OIDC redirect: the mock provider sends the browser
 * back here with `?code=...&state=...` after the user authenticates. This
 * page's only job is to hand that off to completeCallback(), which verifies
 * `state`, exchanges the code for tokens via PKCE, and verifies the ID
 * token's signature — then we redirect into the app.
 */
export const CallbackPage: React.FC<CallbackPageProps> = ({ onNavigate }) => {
  const { completeCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    completeCallback(window.location.search)
      .then(() => {
        // Clean the ?code&state out of the URL, then continue into the app.
        window.history.replaceState({}, '', '/');
        onNavigate('dashboard');
      })
      .catch((err: Error) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card padding="lg" shadow="md" className="max-w-md text-center">
          <h2 className="text-lg font-semibold text-red-600">Sign-in failed</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Button className="mt-4" variant="primary" fullWidth onClick={() => onNavigate('login')}>
            Back to sign in
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
      <Spinner size="lg" label="Verifying sign-in…" />
      <p className="text-sm text-gray-500">Exchanging authorization code for tokens (PKCE)…</p>
    </div>
  );
};
