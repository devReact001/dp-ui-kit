export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
export type ColorScheme = 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple';

export interface BaseProps {
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}
