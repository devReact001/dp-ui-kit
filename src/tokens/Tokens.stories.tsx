import type { Meta, StoryObj } from '@storybook/react-vite';
import { colorScale, spacingScale, radiusScale, typographyScale } from './index';

const meta = {
  title: 'Foundations/Design Tokens',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
      {Object.entries(colorScale).map(([name, shades]) => (
        <div key={name}>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'capitalize' }}>{name}</p>
          {Object.entries(shades)
            .filter(([k]) => k !== 'text')
            .map(([shade, cls]) => (
              <div key={shade} className={cls as string} style={{ height: 28, borderRadius: 4, marginBottom: 2, display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: 10, color: '#1f2937' }}>
                {shade}
              </div>
            ))}
        </div>
      ))}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Object.entries(spacingScale).map(([name, value]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 40, fontSize: 12, fontFamily: 'monospace' }}>{name}</span>
          <div style={{ height: 16, width: value, background: '#3b82f6', borderRadius: 2 }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>
        </div>
      ))}
    </div>
  ),
};

export const Radii: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {Object.entries(radiusScale).map(([name, cls]) => (
        <div key={name} style={{ textAlign: 'center' }}>
          <div className={cls as string} style={{ width: 64, height: 64, background: '#3b82f6' }} />
          <p style={{ fontSize: 12, marginTop: 6 }}>{name}</p>
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Object.entries(typographyScale).map(([name, cls]) => (
        <p key={name} className={cls as string}>
          {name.toUpperCase()} — The quick brown fox jumps over the lazy dog
        </p>
      ))}
    </div>
  ),
};
