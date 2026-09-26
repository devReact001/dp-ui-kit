import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import type { ColorScheme } from '../../types';

export interface ToastProps {
  id: string;
  message: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss: (id: string) => void;
}

const typeStyles: Record<string, { bar: string; icon: string; color: ColorScheme }> = {
  success: { bar: 'bg-green-500',  icon: '✓', color: 'green'  },
  error:   { bar: 'bg-red-500',    icon: '✕', color: 'red'    },
  warning: { bar: 'bg-yellow-400', icon: '!', color: 'yellow' },
  info:    { bar: 'bg-blue-500',   icon: 'i', color: 'blue'   },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  description,
  type = 'info',
  duration = 4000,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const { bar, icon } = typeStyles[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'relative flex w-80 items-start gap-3 overflow-hidden rounded-lg',
        'bg-white p-4 shadow-lg ring-1 ring-gray-200',
        'animate-in slide-in-from-right-full duration-300'
      )}
    >
      {/* colour bar */}
      <span aria-hidden="true" className={cn('absolute left-0 top-0 h-full w-1', bar)} />

      {/* icon */}
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
          bar
        )}
      >
        {icon}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{message}</p>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>

      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/* ── Toast Container + hook ─────────────────────────────────── */

export interface ToastItem extends Omit<ToastProps, 'onDismiss'> {}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const positionMap = {
  'top-right':    'top-4 right-4',
  'top-left':     'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left':  'bottom-4 left-4',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
}) => (
  <div
    aria-label="Notifications"
    className={cn('fixed z-50 flex flex-col gap-2', positionMap[position])}
  >
    {toasts.map((t) => (
      <Toast key={t.id} {...t} onDismiss={onDismiss} />
    ))}
  </div>
);
