import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const BaseInput = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = 'text', label, error, leftIcon, rightIcon, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] select-none">
            {label}
          </label>
        )}
        <div className="relative w-full flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={inputType}
            ref={ref}
            className={cn(
              'w-full min-h-[44px] px-3.5 rounded-lg border text-sm transition-all focus:outline-none bg-white dark:bg-[#18181B] text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]',
              leftIcon && 'pl-10',
              (isPassword || rightIcon) && 'pr-10',
              error
                ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                : 'border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] focus:border-primary focus:ring-1 focus:ring-primary',
              className
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              className="absolute right-3 text-[var(--color-neutral-muted-light)] hover:text-[var(--color-neutral-secondary-light)] dark:hover:text-[var(--color-neutral-secondary-dark)] transition-colors focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3 text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] pointer-events-none">
              {rightIcon}
            </div>
          ) : null}
        </div>
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
