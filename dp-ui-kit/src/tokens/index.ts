/**
 * Design tokens — the single source of truth for the visual language
 * of dp-ui-kit. Every component's variant/size maps are derived from
 * these tokens instead of hard-coding Tailwind classes ad hoc, which is
 * what lets a design system scale to 100+ components consistently:
 * change a token here and every component that references it updates
 * together, and new components generated via `npm run generate` are
 * wired to the same scale from day one.
 */

export const colorScale = {
  blue:   { 50: 'bg-blue-50',   100: 'bg-blue-100',   500: 'bg-blue-500',   600: 'bg-blue-600',   700: 'bg-blue-700',   text: 'text-blue-800'   },
  green:  { 50: 'bg-green-50',  100: 'bg-green-100',  500: 'bg-green-500',  600: 'bg-green-600',  700: 'bg-green-700',  text: 'text-green-800'  },
  red:    { 50: 'bg-red-50',    100: 'bg-red-100',    500: 'bg-red-500',    600: 'bg-red-600',    700: 'bg-red-700',    text: 'text-red-800'    },
  yellow: { 50: 'bg-yellow-50', 100: 'bg-yellow-100', 500: 'bg-yellow-400', 600: 'bg-yellow-500', 700: 'bg-yellow-600', text: 'text-yellow-800' },
  gray:   { 50: 'bg-gray-50',   100: 'bg-gray-100',   500: 'bg-gray-400',   600: 'bg-gray-600',   700: 'bg-gray-700',   text: 'text-gray-700'   },
  purple: { 50: 'bg-purple-50', 100: 'bg-purple-100', 500: 'bg-purple-500', 600: 'bg-purple-600', 700: 'bg-purple-700', text: 'text-purple-800' },
} as const;

export const spacingScale = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
} as const;

export const radiusScale = {
  none: 'rounded-none',
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
} as const;

export const typographyScale = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
} as const;

export const shadowScale = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
} as const;

export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
