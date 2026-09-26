import React from 'react';
import { cn } from '../../utils/cn';
import type { Size } from '../../types';

export interface SpinnerProps {
  size?: Size;
  className?: string;
  label?: string;
}

const sizeMap: Record<Size, string> = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-10 w-10 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  label = 'Loading…',
}) => (
  <span role="status" aria-label={label} className="inline-flex">
    <span
      className={cn(
        'animate-spin rounded-full border-current border-r-transparent',
        sizeMap[size],
        className
      )}
    />
    <span className="sr-only">{label}</span>
  </span>
);
