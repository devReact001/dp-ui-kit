import React, { useState, useMemo } from 'react';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Badge } from '../components/Badge/Badge';
import { Card } from '../components/Card/Card';
import { Modal } from '../components/Modal/Modal';
import { Table, Column } from '../components/Table/Table';
import { Dropdown } from '../components/Dropdown/Dropdown';
import { Toast, ToastContainer, ToastItem } from '../components/Toast/Toast';
import { Tooltip } from '../components/Tooltip/Tooltip';
import type { ColorScheme } from '../types';

interface UserManagementPageProps {
  onNavigate: (page: string) => void;
}

type Role = 'Admin' | 'Editor' | 'Viewer' | 'Manager';
type Status = 'Active' | 'Inactive' | 'Pending';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string;
  lastActive: string;
}

const INITIAL_USERS: User[] = [
  { id: 'U001', name: 'Deepak Prasad',  email: 'deepak@pwc.com',    role: 'Admin',   status: 'Active',   joined: '01 Apr 2024', lastActive: 'Today'    },
  { id: 'U002', name: 'Priya Sharma',   email: 'priya@pwc.com',     role: 'Manager', status: 'Active',   joined: '15 May 2024', lastActive: 'Yesterday' },
  { id: 'U003', name: 'Arjun Mehta',    email: 'arjun@pwc.com',     role: 'Editor',  status: 'Pending',  joined: '20 Jun 2024', lastActive: '3 days ago' },
  { id: 'U004', name: 'Sneha Iyer',     email: 'sneha@pwc.com',     role: 'Viewer',  status: 'Active',   joined: '01 Jul 2024', lastActive: '2 hours ago' },
  { id: 'U005', name: 'Rahul Verma',    email: 'rahul@mphasis.com', role: 'Editor',  status: 'Inactive', joined: '10 Aug 2024', lastActive: '2 weeks ago' },
  { id: 'U006', name: 'Kavya Nair',     email: 'kavya@pwc.com',     role: 'Manager', status: 'Active',   joined: '01 Sep 2024', lastActive: '5 min ago'  },
];

const roleColors: Record<Role, ColorScheme> = { Admin: 'purple', Manager: 'blue', Editor: 'green', Viewer: 'gray' };
const statusColors: Record<Status, ColorScheme> = { Active: 'green', Inactive: 'gray', Pending: 'yellow' };

const ROLES: Role[] = ['Admin', 'Manager', 'Editor', 'Viewer'];

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Viewer' as Role });
  const [formError, setFormError] = useState('');

  const addToast = (t: Omit<ToastItem, 'id'>) =>
    setToasts((p) => [...p, { ...t, id: crypto.randomUUID() }]);
  const dismissToast = (id: string) => setToasts((p) => p.filter((x) => x.id !== id));

  const filtered = useMemo(() =>
    users.filter((u) =>
      (filterStatus === 'All' || u.status === filterStatus) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
       u.email.toLowerCase().includes(search.toLowerCase()))
    ), [users, search, filterStatus]);

  const handleRoleChange = (user: User, role: Role) => {
    setUsers((p) => p.map((u) => u.id === user.id ? { ...u, role } : u));
    addToast({ message: `${user.name}'s role updated to ${role}`, type: 'success' });
  };

  const handleToggleStatus = (user: User) => {
    const next: Status = user.status === 'Active' ? 'Inactive' : 'Active';
    setUsers((p) => p.map((u) => u.id === user.id ? { ...u, status: next } : u));
    addToast({ message: `${user.name} set to ${next}`, type: next === 'Active' ? 'success' : 'warning' });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setUsers((p) => p.filter((u) => u.id !== deleteTarget.id));
    addToast({ message: `${deleteTarget.name} removed`, type: 'error' });
    setDeleteTarget(null);
  };

  const handleAdd = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      setFormError('Enter a valid email address.');
      return;
    }
    const id = `U${String(users.length + 1).padStart(3, '0')}`;
    setUsers((p) => [...p, {
      ...newUser, id,
      status: 'Pending', joined: 'Today', lastActive: 'Never',
    }]);
    addToast({ message: `${newUser.name} invited`, type: 'success', description: 'Pending email verification' });
    setNewUser({ name: '', email: '', role: 'Viewer' });
    setFormError('');
    setAddOpen(false);
  };

  const columns: Column<User>[] = [
    {
      key: 'name', header: 'User', sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{u.name}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', header: 'Role', width: '140px',
      render: (u) => (
        <Dropdown
          trigger={
            <button className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">
              <Badge color={roleColors[u.role]} size="sm">{u.role}</Badge>
              <span className="text-gray-400">▾</span>
            </button>
          }
          items={ROLES.map((r) => ({ label: r, value: r }))}
          onSelect={(item) => handleRoleChange(u, item.value as Role)}
        />
      ),
    },
    {
      key: 'status', header: 'Status', width: '110px',
      render: (u) => <Badge color={statusColors[u.status]} dot rounded>{u.status}</Badge>,
    },
    { key: 'joined',     header: 'Joined',      sortable: true, width: '120px' },
    { key: 'lastActive', header: 'Last Active',  sortable: true, width: '130px' },
    {
      key: 'actions', header: 'Actions', align: 'right', width: '160px',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Tooltip content={u.status === 'Active' ? 'Deactivate' : 'Activate'} placement="top">
            <Button
              variant="ghost" size="xs"
              aria-label={u.status === 'Active' ? 'Deactivate user' : 'Activate user'}
              onClick={() => handleToggleStatus(u)}
            >
              {u.status === 'Active' ? '⏸' : '▶'}
            </Button>
          </Tooltip>
          <Tooltip content="Edit user" placement="top">
            <Button variant="ghost" size="xs" aria-label="Edit user" onClick={() => setEditTarget(u)}>✎</Button>
          </Tooltip>
          <Tooltip content="Delete user" placement="top">
            <Button variant="ghost" size="xs" aria-label="Delete user" onClick={() => setDeleteTarget(u)}>🗑</Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <span className="font-semibold text-gray-900">dp-ui-kit</span>
          </div>
          <nav className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>Dashboard</Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('showcase')}>Showcase</Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Heading */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">
              {filtered.length} of {users.length} users
              {filterStatus !== 'All' && ` · ${filterStatus}`}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            + Invite User
          </Button>
        </div>

        {/* Filters */}
        <Card shadow="sm" padding="sm" className="mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48">
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search users"
                size="sm"
              />
            </div>
            <div className="flex gap-1">
              {(['All', 'Active', 'Inactive', 'Pending'] as const).map((s) => (
                <Button
                  key={s}
                  variant={filterStatus === s ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card padding="none" shadow="sm">
          <Table<User>
            columns={columns}
            data={filtered}
            striped
            hoverable
            emptyMessage="No users match your search"
            caption="User management table"
          />
        </Card>
      </main>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove User"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Remove</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to remove <strong>{deleteTarget?.name}</strong>?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit User"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => {
              addToast({ message: `${editTarget?.name} updated`, type: 'success' });
              setEditTarget(null);
            }}>Save</Button>
          </>
        }
      >
        {editTarget && (
          <div className="flex flex-col gap-4">
            <Input label="Full Name" defaultValue={editTarget.name} size="sm" />
            <Input label="Email" defaultValue={editTarget.email} type="email" size="sm" />
          </div>
        )}
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setFormError(''); }}
        title="Invite New User"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAdd}>Send Invite</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Full Name" placeholder="Jane Doe" size="sm"
            value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Email" placeholder="jane@company.com" type="email" size="sm"
            value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
            <div className="flex gap-2 flex-wrap">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setNewUser((p) => ({ ...p, role: r }))}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  <Badge
                    color={roleColors[r]}
                    rounded
                    className={newUser.role === r ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-60'}
                  >
                    {r}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
          {formError && <p className="text-xs text-red-600" role="alert">{formError}</p>}
        </div>
      </Modal>
    </div>
  );
};
