import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import type { Size, BaseProps } from '../../types';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    BaseProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  size?: Size;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  isInvalid?: boolean;
}

const sizeStyles: Record<Size, string> = {
  xs: 'h-6  px-2 text-xs',
  sm: 'h-8  px-3 text-sm',
  md: 'h-10 px-3 text-sm',
  lg: 'h-11 px-4 text-base',
  xl: 'h-12 px-4 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      size = 'md',
      leftAddon,
      rightAddon,
      isInvalid,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const invalid = isInvalid || Boolean(errorText);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <span className="absolute left-3 text-gray-400">{leftAddon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={invalid}
            aria-describedby={
              errorText ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'w-full rounded-md border bg-white text-gray-900',
              'placeholder:text-gray-400',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              invalid
                ? 'border-red-500 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-500',
              Boolean(leftAddon) && 'pl-9',
              Boolean(rightAddon) && 'pr-9',
              sizeStyles[size],
              className
            )}
            {...props}
          />
          {rightAddon && (
            <span className="absolute right-3 text-gray-400">{rightAddon}</span>
          )}
        </div>

        {errorText && (
          <p id={errorId} role="alert" className="text-xs text-red-600">
            {errorText}
          </p>
        )}
        {!errorText && helperText && (
          <p id={helperId} className="text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
