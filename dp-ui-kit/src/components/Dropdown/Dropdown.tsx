import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '../../utils/cn';

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactElement;
  items: DropdownItem[];
  onSelect: (item: DropdownItem) => void;
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  onSelect,
  align = 'left',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block" onKeyDown={handleKeyDown}>
      {React.cloneElement(trigger, {
        onClick: () => setOpen((o) => !o),
        'aria-haspopup': 'listbox',
        'aria-expanded': open,
        'aria-controls': listId,
      })}

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Options"
          className={cn(
            'absolute z-50 mt-1 min-w-[10rem] rounded-lg border border-gray-200',
            'bg-white py-1 shadow-lg',
            'animate-in fade-in slide-in-from-top-1 duration-150',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {items.map((item) => (
            <li
              key={item.value}
              role="option"
              aria-selected={false}
              aria-disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  onSelect(item);
                  setOpen(false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!item.disabled) { onSelect(item); setOpen(false); }
                }
              }}
              tabIndex={item.disabled ? -1 : 0}
              className={cn(
                'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm',
                'focus-visible:bg-gray-50 focus-visible:outline-none',
                item.disabled
                  ? 'pointer-events-none opacity-40'
                  : item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
