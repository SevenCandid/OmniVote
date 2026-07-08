import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const BaseInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] select-none">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full min-h-[44px] px-3.5 rounded-lg border text-sm transition-all focus:outline-none bg-white dark:bg-[#18181B] text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]',
            error
              ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
              : 'border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] focus:border-primary focus:ring-1 focus:ring-primary',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-danger select-none">
            {error}
          </span>
        )}
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';
