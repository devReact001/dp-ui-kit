import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    shadow: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    bordered: { control: 'boolean' },
    hoverable: { control: 'boolean' },
  },
  args: {
    children: 'This is the card body content.',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Card {...args} />
    </div>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Card
        {...args}
        header="Card title"
        footer={<Button size="sm">Confirm</Button>}
      />
    </div>
  ),
};

export const Hoverable: Story = {
  args: { hoverable: true },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Card {...args} />
    </div>
  ),
};
