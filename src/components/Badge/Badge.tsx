import React from 'react';
import { cn } from '../../utils/cn';
import type { ColorScheme, Size, BaseProps } from '../../types';

export interface BadgeProps extends BaseProps {
  children: React.ReactNode;
  color?: ColorScheme;
  size?: Extract<Size, 'sm' | 'md' | 'lg'>;
  rounded?: boolean;
  dot?: boolean;
}

const colorStyles: Record<ColorScheme, string> = {
  blue:   'bg-blue-100 text-blue-800',
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  gray:   'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-800',
};

const dotColors: Record<ColorScheme, string> = {
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  red:    'bg-red-500',
  yellow: 'bg-yellow-500',
  gray:   'bg-gray-400',
  purple: 'bg-purple-500',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'blue',
  size = 'md',
  rounded = false,
  dot = false,
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 font-medium',
      rounded ? 'rounded-full' : 'rounded',
      colorStyles[color],
      sizeStyles[size],
      className
    )}
  >
    {dot && (
      <span
        aria-hidden="true"
        className={cn('h-1.5 w-1.5 rounded-full', dotColors[color])}
      />
    )}
    {children}
  </span>
);
