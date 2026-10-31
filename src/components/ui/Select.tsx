import * as React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      children,
      leftIcon,
      className = '',
      containerClassName = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className={`w-full space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
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
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400 select-none">
              {leftIcon}
            </div>
          )}

          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full min-h-[48px] px-3.5 py-2.5 text-sm rounded-xl font-medium transition-all duration-150 appearance-none ' +
              'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white ' +
              'border ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-400/40'
                  : 'border-neutral-300 dark:border-neutral-700 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/40'
              } ' +
              'focus:outline-none ' +
              'disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-neutral-200 dark:disabled:border-neutral-800 ' +
              ${leftIcon ? 'pl-11' : ''} pr-11 ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3.5 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 shrink-0" />
            )}
          </div>
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

Select.displayName = 'Select';
