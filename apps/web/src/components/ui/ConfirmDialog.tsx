import React from 'react';
import { BaseDialog } from './BaseDialog';
import { BaseButton } from './BaseButton';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-zinc-600 dark:text-zinc-300">
          {description}
        </p>
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <BaseButton variant="secondary" onClick={onClose} disabled={isConfirming}>
            {cancelText}
          </BaseButton>
          <BaseButton variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isConfirming}>
            {confirmText}
          </BaseButton>
        </div>
      </div>
    </BaseDialog>
  );
}
