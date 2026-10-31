import * as React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl select-none transition-all duration-150 relative ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ' +
      'active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variants = {
      primary:
        'bg-primary-900 hover:bg-primary-950 text-white shadow-elevation-1 hover:shadow-elevation-2 active:bg-primary-950 dark:bg-primary-500 dark:hover:bg-primary-600 dark:text-neutral-950',
      accent:
        'bg-accent-500 hover:bg-accent-600 text-neutral-950 shadow-elevation-1 hover:shadow-elevation-2 active:bg-accent-700 font-bold',
      outline:
        'border-2 border-primary-900 dark:border-primary-400 text-primary-900 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/50 active:bg-primary-100',
      secondary:
        'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700',
      ghost:
        'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white',
      danger:
        'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-elevation-1 hover:shadow-elevation-2',
    };

    // Requirements: 48px minimum touch targets across all interactive buttons
    const sizes = {
      sm: 'min-h-[48px] px-3.5 py-2 text-xs gap-1.5',
      md: 'min-h-[48px] px-5 py-2.5 text-sm gap-2',
      lg: 'min-h-[52px] px-6 py-3 text-base gap-2.5',
      icon: 'min-h-[48px] min-w-[48px] w-12 h-12 p-0 text-base',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
