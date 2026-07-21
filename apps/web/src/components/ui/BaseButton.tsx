import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function BaseButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-semibold tracking-wide rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary select-none cursor-pointer';

  const variants = {
    primary:
      'bg-primary text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)] border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] hover:scale-[1.02] active:scale-[0.98]',
    outline:
      'border border-primary text-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98]',
    ghost: 'text-primary hover:bg-primary/5',
    danger:
      'bg-danger text-white hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] focus:ring-danger',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs min-h-[36px]',
    md: 'px-6 py-2.5 text-sm min-h-[44px]', // touch target 44px
    lg: 'px-8 py-3 text-base min-h-[48px]',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        isDisabled &&
          'opacity-50 cursor-not-allowed transform-none hover:scale-100 active:scale-100 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-none',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="mr-2 inline-flex">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
}
