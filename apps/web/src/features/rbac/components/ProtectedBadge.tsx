import React from 'react';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { ShieldAlert } from 'lucide-react';

interface ProtectedBadgeProps {
  isSystem: boolean;
}

export function ProtectedBadge({ isSystem }: ProtectedBadgeProps) {
  if (!isSystem) return null;

  return (
    <BaseBadge
      variant="neutral"
      className="flex items-center gap-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
    >
      <ShieldAlert className="w-3 h-3" />
      System Role
    </BaseBadge>
  );
}
