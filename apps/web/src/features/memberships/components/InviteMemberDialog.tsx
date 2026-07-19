import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseDialog } from '../../../components/ui/BaseDialog';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import { InviteMemberInput, InviteMemberSchema } from '../schemas/membershipSchema';
import { useInviteMember } from '../hooks/useMemberships';
import { toast } from 'react-hot-toast';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export function InviteMemberDialog({ isOpen, onClose, organizationId }: InviteMemberDialogProps) {
  const { mutateAsync: inviteMember, isPending } = useInviteMember();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(InviteMemberSchema),
  });

  const onSubmit = async (data: InviteMemberInput) => {
    try {
      await inviteMember({ organizationId, data });
      toast.success('Invitation sent successfully');
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={handleClose} title="Invite Member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
        <BaseInput
          label="Email Address"
          type="email"
          placeholder="Enter the recipient's email"
          error={errors.recipient_email?.message}
          {...register('recipient_email')}
        />
        <BaseInput
          label="Roles (comma separated)"
          placeholder="e.g. Member, Editor"
          error={errors.initial_roles?.message as string | undefined}
          {...register('initial_roles', {
            setValueAs: (v) => (v ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined)
          })}
        />
        
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <BaseButton type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </BaseButton>
          <BaseButton type="submit" isLoading={isPending}>
            Send Invitation
          </BaseButton>
        </div>
      </form>
    </BaseDialog>
  );
}
