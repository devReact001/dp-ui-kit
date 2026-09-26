import React, { useState } from 'react';
import { Card } from '../components/Card/Card';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Spinner } from '../components/Spinner/Spinner';
import { Table, Column } from '../components/Table/Table';
import { Tooltip } from '../components/Tooltip/Tooltip';
import { ToastContainer, ToastItem } from '../components/Toast/Toast';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

interface Transaction {
  id: string;
  description: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  type: 'credit' | 'debit';
  // Table<T> requires T extends Record<string, unknown> so it can index rows
  // by an arbitrary Column<T>['key'] — this index signature is what satisfies
  // that constraint for a plain, fully-typed interface like this one.
  [key: string]: unknown;
}

const transactions: Transaction[] = [
  { id: 'TXN001', description: 'Salary Credit',        amount: '₹1,25,000', status: 'completed', date: '01 Jun 2026', type: 'credit' },
  { id: 'TXN002', description: 'AWS Infrastructure',   amount: '₹8,400',   status: 'completed', date: '03 Jun 2026', type: 'debit'  },
  { id: 'TXN003', description: 'Vendor Payment – UI',  amount: '₹22,000',  status: 'pending',   date: '05 Jun 2026', type: 'debit'  },
  { id: 'TXN004', description: 'Consulting Invoice',   amount: '₹45,000',  status: 'completed', date: '08 Jun 2026', type: 'credit' },
  { id: 'TXN005', description: 'Subscription – Figma', amount: '₹1,200',  status: 'failed',    date: '10 Jun 2026', type: 'debit'  },
  { id: 'TXN006', description: 'Freelance Project',    amount: '₹30,000',  status: 'completed', date: '12 Jun 2026', type: 'credit' },
];

const statusBadge = (s: Transaction['status']) => {
  const map = { completed: 'green', pending: 'yellow', failed: 'red' } as const;
  return <Badge color={map[s]} dot rounded>{s.charAt(0).toUpperCase() + s.slice(1)}</Badge>;
};

const columns: Column<Transaction>[] = [
  { key: 'id',          header: 'Txn ID',      sortable: true,  width: '110px' },
  { key: 'description', header: 'Description', sortable: true  },
  { key: 'date',        header: 'Date',         sortable: true,  width: '130px' },
  { key: 'type',        header: 'Type',         width: '80px',
    render: (r) => (
      <span className={r.type === 'credit' ? 'text-green-600 font-medium' : 'text-gray-500'}>
        {r.type === 'credit' ? '↑ Credit' : '↓ Debit'}
      </span>
    )
  },
  { key: 'amount',  header: 'Amount',  align: 'right', sortable: true, width: '120px',
    render: (r) => (
      <span className={r.type === 'credit' ? 'font-semibold text-green-700' : 'font-medium text-gray-700'}>
        {r.type === 'credit' ? '+' : '−'}{r.amount}
      </span>
    )
  },
  { key: 'status',  header: 'Status',  width: '120px', render: (r) => statusBadge(r.status) },
];

const StatCard: React.FC<{
  label: string; value: string; sub: string; color: string; icon: string; trend?: string;
}> = ({ label, value, sub, color, icon, trend }) => (
  <Card shadow="sm" padding="md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${color}`}>
        {icon}
      </div>
    </div>
    {trend && (
      <p className="mt-3 text-xs font-medium text-green-600">▲ {trend} vs last month</p>
    )}
  </Card>
);

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (t: Omit<ToastItem, 'id'>) =>
    setToasts((prev) => [...prev, { ...t, id: crypto.randomUUID() }]);
  const dismissToast = (id: string) =>
    setToasts((prev) => prev.filter((x) => x.id !== id));

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    addToast({ message: 'Dashboard refreshed', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Nav */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <span className="font-semibold text-gray-900">dp-ui-kit</span>
            <Badge color="blue" size="sm">Enterprise</Badge>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>Login</Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('users')}>Users</Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('showcase')}>Showcase</Button>
            <Tooltip content="Refresh dashboard data" placement="bottom">
              <Button variant="outline" size="sm" onClick={handleRefresh} loading={loading}>
                ↻ Refresh
              </Button>
            </Tooltip>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Page heading */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, Deepak · June 2026</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export CSV</Button>
            <Button variant="primary" size="sm" onClick={() => onNavigate('users')}>
              Manage Users
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Revenue"    value="₹2,20,000" sub="Jun 2026"        color="bg-blue-50 text-blue-600"   icon="💰" trend="12%" />
          <StatCard label="Active Users"     value="1,284"     sub="across modules"  color="bg-green-50 text-green-600" icon="👥" trend="8%"  />
          <StatCard label="Pending Txns"     value="3"         sub="awaiting review" color="bg-yellow-50 text-yellow-600" icon="⏳" />
          <StatCard label="Failed Txns"      value="1"         sub="needs attention" color="bg-red-50 text-red-500"     icon="⚠️" />
        </div>

        {/* Quick Badges */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge color="blue" dot>React 18</Badge>
          <Badge color="purple" dot>TypeScript 5</Badge>
          <Badge color="green" dot>Tailwind CSS</Badge>
          <Badge color="yellow" dot>WCAG 2.1 AA</Badge>
          <Badge color="gray" dot>Jest + RTL</Badge>
        </div>

        {/* Transactions Table */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <span>Recent Transactions</span>
              {loading && <Spinner size="sm" />}
            </div>
          }
          padding="none"
          shadow="sm"
        >
          <Table<Transaction>
            columns={columns}
            data={transactions}
            loading={loading}
            striped
            hoverable
            caption="Recent bank transactions"
            emptyMessage="No transactions found"
            onRowClick={(row) =>
              addToast({ message: `Viewing ${row.id}`, type: 'info', description: row.description })
            }
          />
        </Card>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Built with dp-ui-kit · React · TypeScript · Tailwind CSS · WCAG 2.1 AA
        </p>
      </main>
    </div>
  );
};
