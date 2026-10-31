import * as React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftAddon,
      rightAddon,
      className = '',
      containerClassName = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className={`w-full space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-xs font-bold uppercase tracking-wider ${
              error
                ? 'text-red-600 dark:text-red-400'
                : disabled
                ? 'text-neutral-400 dark:text-neutral-600'
                : 'text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400 select-none">
              {leftAddon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full min-h-[48px] px-3.5 py-2.5 text-sm rounded-xl font-medium transition-all duration-150 ' +
              'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 ' +
              'border ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-400/40'
                  : 'border-neutral-300 dark:border-neutral-700 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/40'
              } ' +
              'focus:outline-none ' +
              'disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-neutral-200 dark:disabled:border-neutral-800 ' +
              ${leftAddon ? 'pl-11' : ''} ${rightAddon || error ? 'pr-11' : ''} ${className}`}
            {...props}
          />

          {error ? (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-red-500">
              <AlertCircle className="w-5 h-5 shrink-0" />
            </div>
          ) : (
            rightAddon && (
              <div className="absolute right-3.5 flex items-center text-neutral-500 dark:text-neutral-400">
                {rightAddon}
              </div>
            )
          )}
        </div>

        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
            <span>{error}</span>
          </p>
        ) : (
          helperText && (
            <p className="text-2xs text-neutral-500 dark:text-neutral-400 mt-1">
              {helperText}
            </p>
          )
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
