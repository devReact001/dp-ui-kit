import React, { useState } from 'react';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Badge } from '../components/Badge/Badge';
import { Card } from '../components/Card/Card';
import { Modal } from '../components/Modal/Modal';
import { Spinner } from '../components/Spinner/Spinner';
import { Toast, ToastContainer, ToastItem } from '../components/Toast/Toast';
import { Tooltip } from '../components/Tooltip/Tooltip';
import { Dropdown } from '../components/Dropdown/Dropdown';
import { Table, Column } from '../components/Table/Table';
import type { Variant, Size, ColorScheme } from '../types';

interface ShowcasePageProps {
  onNavigate: (page: string) => void;
}

const VARIANTS: Variant[] = ['primary','secondary','success','danger','warning','ghost','outline'];
const SIZES: Size[]        = ['xs','sm','md','lg','xl'];
const COLORS: ColorScheme[] = ['blue','green','red','yellow','gray','purple'];

interface SampleRow { id: number; name: string; tech: string; stars: number; }
const tableData: SampleRow[] = [
  { id: 1, name: 'dp-ui-kit',    tech: 'React + TypeScript', stars: 128 },
  { id: 2, name: 'react-query',  tech: 'TypeScript',         stars: 40000 },
  { id: 3, name: 'tailwindcss',  tech: 'PostCSS',            stars: 82000 },
  { id: 4, name: 'zustand',      tech: 'TypeScript',         stars: 45000 },
];
const tableColumns: Column<SampleRow>[] = [
  { key: 'id',   header: '#',        width: '50px' },
  { key: 'name', header: 'Package',  sortable: true },
  { key: 'tech', header: 'Tech',     sortable: true },
  { key: 'stars',header: '⭐ Stars', sortable: true, align: 'right',
    render: (r) => <span className="font-mono text-sm">{r.stars.toLocaleString()}</span> },
];

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="mb-4 text-base font-semibold text-gray-700 border-b border-gray-200 pb-2">{title}</h2>
    {children}
  </section>
);

export const ShowcasePage: React.FC<ShowcasePageProps> = ({ onNavigate }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (t: Omit<ToastItem, 'id'>) =>
    setToasts((p) => [...p, { ...t, id: crypto.randomUUID() }]);
  const dismissToast = (id: string) =>
    setToasts((p) => p.filter((x) => x.id !== id));

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
            <Badge color="blue" size="sm">v1.0.0</Badge>
          </div>
          <nav className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>Login</Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>Dashboard</Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('users')}>Users</Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Component Showcase</h1>
          <p className="mt-2 text-gray-500">Every component in dp-ui-kit — React · TypeScript · Tailwind · WCAG 2.1 AA</p>
          <div className="mt-4 flex justify-center gap-2 flex-wrap">
            {['React 18', 'TypeScript 5', 'Tailwind 3', 'WCAG 2.1 AA', '10 Components'].map((t) => (
              <Badge key={t} color="blue" rounded size="sm">{t}</Badge>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <Section title="Button — 7 variants · 5 sizes · loading state">
          <div className="flex flex-wrap gap-2 mb-4">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v} size="md">{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-2 mb-4">
            {SIZES.map((s) => (
              <Button key={s} variant="primary" size={s}>{s.toUpperCase()}</Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="primary" loading>Loading…</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" fullWidth={false} leftIcon={<span>⭐</span>}>With Icon</Button>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badge — 6 colours · dot · pill">
          <div className="flex flex-wrap gap-2 mb-3">
            {COLORS.map((c) => (
              <Badge key={c} color={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <Badge key={c} color={c} dot rounded>{c}</Badge>
            ))}
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Input — label · helper · error · addons">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Default" placeholder="Enter value…" value={inputValue} onChange={(e) => setInputValue(e.target.value)} helperText="This is helper text" />
            <Input label="With Error" placeholder="Enter email" errorText="Invalid email address" isInvalid />
            <Input label="Left Addon" leftAddon={<span>🔍</span>} placeholder="Search…" />
            <Input label="Disabled" placeholder="Cannot edit" disabled value="Read only" />
          </div>
        </Section>

        {/* Spinner */}
        <Section title="Spinner — 5 sizes">
          <div className="flex items-end gap-6">
            {SIZES.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Spinner size={s} />
                <span className="text-xs text-gray-400">{s}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Cards */}
        <Section title="Card — shadow · header · footer · hoverable">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card shadow="sm" header="Small Shadow">Basic card with sm shadow</Card>
            <Card shadow="md" header="Medium Shadow" footer="Card footer">Card with header and footer</Card>
            <Card shadow="lg" hoverable onClick={() => addToast({ message: 'Card clicked!', type: 'info' })}>
              Hoverable + clickable card (try clicking me)
            </Card>
          </div>
        </Section>

        {/* Tooltip */}
        <Section title="Tooltip — 4 placements · keyboard accessible">
          <div className="flex flex-wrap gap-4 justify-center py-6">
            {(['top','bottom','left','right'] as const).map((p) => (
              <Tooltip key={p} content={`Tooltip on ${p}`} placement={p}>
                <Button variant="outline" size="sm">{p}</Button>
              </Tooltip>
            ))}
          </div>
        </Section>

        {/* Dropdown */}
        <Section title="Dropdown — keyboard nav · ARIA listbox">
          <div className="flex gap-4">
            <Dropdown
              trigger={<Button variant="outline" size="sm">Actions ▾</Button>}
              items={[
                { label: 'Edit', value: 'edit' },
                { label: 'Duplicate', value: 'dup' },
                { label: 'Archive', value: 'archive', disabled: true },
                { label: 'Delete', value: 'delete', danger: true },
              ]}
              onSelect={(i) => addToast({ message: `Selected: ${i.label}`, type: 'info' })}
            />
            <Dropdown
              trigger={<Button variant="primary" size="sm">Export ▾</Button>}
              items={[
                { label: 'Export as CSV',  value: 'csv'  },
                { label: 'Export as JSON', value: 'json' },
                { label: 'Export as PDF',  value: 'pdf'  },
              ]}
              onSelect={(i) => addToast({ message: `Exporting as ${i.label.split(' ').pop()}`, type: 'success' })}
              align="right"
            />
          </div>
        </Section>

        {/* Toast */}
        <Section title="Toast — 4 types · auto-dismiss">
          <div className="flex flex-wrap gap-2">
            {(['success','error','warning','info'] as const).map((t) => (
              <Button key={t} variant="outline" size="sm"
                onClick={() => addToast({ message: `${t.charAt(0).toUpperCase() + t.slice(1)} toast`, type: t, description: 'Auto-dismisses in 4s' })}>
                {t}
              </Button>
            ))}
          </div>
        </Section>

        {/* Modal */}
        <Section title="Modal — focus trap · Escape key · ARIA dialog">
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Accessible Modal"
            footer={
              <>
                <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={() => { setModalOpen(false); addToast({ message: 'Saved!', type: 'success' }); }}>Save</Button>
              </>
            }
          >
            <p className="text-gray-600 mb-4">
              This modal traps focus, closes on <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">Escape</kbd>, and announces itself to screen readers via ARIA.
            </p>
            <Input label="Your input" placeholder="Type something…" />
          </Modal>
        </Section>

        {/* Table */}
        <Section title="Table — sortable · loading · empty state">
          <Table<SampleRow>
            columns={tableColumns}
            data={tableData}
            striped
            hoverable
            caption="Package comparison table"
            onRowClick={(r) => addToast({ message: `Selected: ${r.name}`, type: 'info' })}
          />
        </Section>
      </main>
    </div>
  );
};
