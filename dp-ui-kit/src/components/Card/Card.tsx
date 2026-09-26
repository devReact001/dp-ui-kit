import React from 'react';
import { cn } from '../../utils/cn';
import type { BaseProps } from '../../types';

export interface CardProps extends BaseProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

const shadowMap = {
  none: '',
  sm:   'shadow-sm',
  md:   'shadow-md',
  lg:   'shadow-lg',
};

const paddingMap = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
};

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  shadow = 'sm',
  padding = 'md',
  bordered = true,
  hoverable = false,
  onClick,
  className,
  ...rest
}) => {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={cn(
        'rounded-xl bg-white',
        bordered && 'border border-gray-200',
        shadowMap[shadow],
        hoverable && 'transition-shadow hover:shadow-md cursor-pointer',
        onClick && 'text-left w-full',
        className
      )}
      {...(onClick ? { type: 'button' } : {})}
      {...rest}
    >
      {header && (
        <div className="border-b border-gray-100 px-5 py-3 font-semibold text-gray-800">
          {header}
        </div>
      )}
      <div className={paddingMap[padding]}>{children}</div>
      {footer && (
        <div className="border-t border-gray-100 px-5 py-3 text-sm text-gray-500">
          {footer}
        </div>
      )}
    </Tag>
  );
};
