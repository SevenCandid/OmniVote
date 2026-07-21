import React from 'react';
import { BaseDialog } from '../../../components/ui/BaseDialog';
import { BaseButton } from '../../../components/ui/BaseButton';

interface RevokeInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isRevoking: boolean;
}

export function RevokeInvitationModal({
  isOpen,
  onClose,
  onConfirm,
  isRevoking,
}: RevokeInvitationModalProps) {
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title="Remove Invitation">
      <div className="space-y-4">
        <p className="text-zinc-600 dark:text-zinc-300">
          Are you sure you want to remove this invitation? If it is pending, the
          recipient will no longer be able to accept it and the invite link will
          become invalid.
        </p>
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <BaseButton
            variant="secondary"
            onClick={onClose}
            disabled={isRevoking}
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="danger"
            onClick={onConfirm}
            isLoading={isRevoking}
          >
            Confirm Remove
          </BaseButton>
        </div>
      </div>
    </BaseDialog>
  );
}
