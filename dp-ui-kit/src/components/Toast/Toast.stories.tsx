import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Toast, ToastContainer, type ToastItem } from './Toast';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['success', 'error', 'warning', 'info'] },
  },
  args: {
    id: '1',
    message: 'Changes saved',
    description: 'Your profile has been updated.',
    onDismiss: fn(),
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { type: 'success' } };
export const ErrorToast: Story = { args: { type: 'error', message: 'Something went wrong' } };
export const Warning: Story = { args: { type: 'warning', message: 'Storage almost full' } };
export const Info: Story = { args: { type: 'info', message: 'New version available' } };

export const ContainerDemo: Story = {
  render: () => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const push = () => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, message: `Notification #${t.length + 1}`, type: 'info' }]);
    };
    return (
      <div>
        <Button onClick={push}>Push a toast</Button>
        <ToastContainer
          toasts={toasts}
          onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
        />
      </div>
    );
  },
};
