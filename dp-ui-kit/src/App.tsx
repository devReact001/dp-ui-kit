import { useState, Suspense, lazy, useEffect } from 'react';
import { Spinner } from './components/Spinner/Spinner';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AuthBar } from './components/AuthBar/AuthBar';
import { CallbackPage } from './pages/CallbackPage';

// Code-split each page into its own chunk. Only the page the user is
// actually viewing is downloaded — the other three pages' JS (and any
// heavy dependencies they pull in) stay out of the initial bundle and
// load on demand when the user navigates to them.
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage').then((m) => ({ default: m.UserManagementPage })));
const ShowcasePage = lazy(() => import('./pages/ShowcasePage').then((m) => ({ default: m.ShowcasePage })));

type Page = 'login' | 'dashboard' | 'users' | 'showcase' | 'callback';

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" label="Loading page…" />
    </div>
  );
}

function AppShell() {
  // The mock OIDC provider redirects back to `${origin}/callback?code=...` —
  // detect that on load/navigation and route to the callback handler instead
  // of whatever `page` state happened to be set before the redirect.
  const isCallback = () => window.location.pathname === '/callback' || window.location.search.includes('code=');
  const [page, setPage] = useState<Page>(isCallback() ? 'callback' : 'showcase');

  useEffect(() => {
    const onPopState = () => setPage(isCallback() ? 'callback' : 'showcase');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (p: string) => setPage(p as Page);

  return (
    <>
      <AuthBar />
      <Suspense fallback={<PageFallback />}>
        {page === 'callback'  && <CallbackPage onNavigate={navigate} />}
        {page === 'login'     && <LoginPage onNavigate={navigate} />}
        {page === 'dashboard' && (
          <ProtectedRoute onNavigate={navigate}>
            <DashboardPage onNavigate={navigate} />
          </ProtectedRoute>
        )}
        {page === 'users' && (
          <ProtectedRoute onNavigate={navigate} requireRole="admin">
            <UserManagementPage onNavigate={navigate} />
          </ProtectedRoute>
        )}
        {page === 'showcase' && <ShowcasePage onNavigate={navigate} />}
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
