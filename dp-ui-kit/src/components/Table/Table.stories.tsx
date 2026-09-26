import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, type Column } from './Table';
import { Badge } from '../Badge/Badge';

interface User extends Record<string, unknown> {
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited';
}

const data: User[] = [
  { name: 'Jane Cooper', email: 'jane@acme.com', role: 'Admin', status: 'active' },
  { name: 'Wade Warren', email: 'wade@acme.com', role: 'Editor', status: 'active' },
  { name: 'Esther Howard', email: 'esther@acme.com', role: 'Viewer', status: 'invited' },
];

const columns: Column<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge color={row.status === 'active' ? 'green' : 'yellow'} rounded>
        {row.status}
      </Badge>
    ),
  },
];

const meta = {
  title: 'Components/Table',
  component: Table<User>,
  tags: ['autodocs'],
  args: { columns, data },
} satisfies Meta<typeof Table<User>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Striped: Story = { args: { striped: true } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
