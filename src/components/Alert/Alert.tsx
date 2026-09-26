import React from 'react';
import { cn } from '../../utils/cn';
import type { BaseProps } from '../../types';

export interface AlertProps extends BaseProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onDismiss?: () => void;
}

const variantStyles: Record<NonNullable<AlertProps['variant']>, string> = {
  info:    'bg-blue-50 text-blue-800 border-blue-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  error:   'bg-red-50 text-red-800 border-red-200',
};

/**
 * Alert — generated via `npm run generate` and fleshed out to match the
 * rest of the library's token-driven variant pattern (see src/tokens).
 */
export const Alert: React.FC<AlertProps> = ({
  children,
  title,
  variant = 'info',
  onDismiss,
  className,
  ...rest
}) => (
  <div
    role="alert"
    className={cn(
      'flex items-start gap-3 rounded-lg border p-4 text-sm',
      variantStyles[variant],
      className
    )}
    {...rest}
  >
    <div className="flex-1">
      {title && <p className="font-semibold">{title}</p>}
      <p>{children}</p>
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        aria-label="Dismiss alert"
        className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

Alert.displayName = 'Alert';
