import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function BaseCard({ children, className, hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#18181B] border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-xl p-6 shadow-sm',
        hoverable && 'transition-all duration-250 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-primary',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
