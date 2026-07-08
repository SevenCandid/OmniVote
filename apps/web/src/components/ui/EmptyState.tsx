import { LucideIcon } from 'lucide-react';
import { BaseButton } from './BaseButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-2xl bg-[var(--color-surface-muted-light)]/50 dark:bg-[var(--color-surface-muted-dark)]/50 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shrink-0 animate-pulse-slow">
        <Icon size={32} />
      </div>
      <h3 className="text-base font-bold mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <BaseButton variant="primary" size="md" onClick={onAction}>
          {actionText}
        </BaseButton>
      )}
    </div>
  );
}
