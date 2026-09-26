/**
 * Utility to merge Tailwind class names conditionally.
 * Lightweight alternative to clsx/classnames.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
