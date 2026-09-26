import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from '../Spinner/Spinner';
import type { Size, Variant, BaseProps } from '../../types';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400',
  success:   'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  warning:   'bg-yellow-400 text-gray-900 hover:bg-yellow-500 focus-visible:ring-yellow-400',
  ghost:     'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400',
  outline:   'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400',
};

const sizeStyles: Record<Size, string> = {
  xs: 'h-6  px-2 text-xs gap-1',
  sm: 'h-8  px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
  xl: 'h-12 px-6 text-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === 'xl' || size === 'lg' ? 'sm' : 'xs'} />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
