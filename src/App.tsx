import React, { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ShowcasePage } from './pages/ShowcasePage';

type Page = 'login' | 'dashboard' | 'users' | 'showcase';

export default function App() {
  const [page, setPage] = useState<Page>('showcase');

  const navigate = (p: string) => setPage(p as Page);

  return (
    <>
      {page === 'login'     && <LoginPage onNavigate={navigate} />}
      {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
      {page === 'users'     && <UserManagementPage onNavigate={navigate} />}
      {page === 'showcase'  && <ShowcasePage onNavigate={navigate} />}
    </>
  );
}
