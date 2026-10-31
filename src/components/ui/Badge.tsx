import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', icon, className = '', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center font-bold tracking-wide select-none transition-colors rounded-full';

    const variants = {
      default:
        'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600',
      primary:
        'bg-primary-100 text-primary-900 dark:bg-primary-950 dark:text-primary-300 border border-primary-200 dark:border-primary-800',
      accent:
        'bg-accent-100 text-accent-900 dark:bg-accent-950 dark:text-accent-300 border border-accent-300 dark:border-accent-700',
      success:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
      warning:
        'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
      danger:
        'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800',
      info:
        'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800',
      outline:
        'border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 bg-transparent',
    };

    const sizes = {
      sm: 'text-2xs px-2 py-0.5 gap-1',
      md: 'text-xs px-2.5 py-1 gap-1.5',
    };

    return (
      <span ref={ref} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </span>
    );
  }
);

Badge.displayName = 'Badge';
