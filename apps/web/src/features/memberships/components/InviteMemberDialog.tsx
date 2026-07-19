import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseDialog } from '../../../components/ui/BaseDialog';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import { InviteMemberInput, InviteMemberSchema } from '../schemas/invitationSchema';
import { useInviteMember } from '../hooks/useMemberships';
import { toast } from 'react-hot-toast';
import { useOrganizations } from '../../organizations/hooks/useOrganizations';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string;
}

export function InviteMemberDialog({ isOpen, onClose, organizationId }: InviteMemberDialogProps) {
  const { mutateAsync: inviteMember, isPending } = useInviteMember();
  const { data: organizations } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState(organizationId || '');
  const [successToken, setSuccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (organizationId) {
      setSelectedOrgId(organizationId);
    } else if (organizations && organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizationId, organizations]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(InviteMemberSchema),
  });

  const onSubmit = async (data: InviteMemberInput) => {
    if (!selectedOrgId) {
      toast.error('Please select an organization');
      return;
    }
    try {
      const result = await inviteMember({ organizationId: selectedOrgId, data });
      setSuccessToken(result.invitation_token);
      toast.success('Invitation sent successfully');
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation');
    }
  };

  const handleClose = () => {
    reset();
    setSuccessToken(null);
    onClose();
  };

  if (successToken) {
    const url = `${window.location.origin}/invite/${successToken}`;
    return (
      <BaseDialog isOpen={isOpen} onClose={handleClose} title="Invitation Created!">
        <div className="space-y-4 mt-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            The invitation was created successfully. You can copy the link below and share it with the recipient.
          </p>
          <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <input 
              readOnly 
              value={url} 
              className="flex-1 bg-transparent text-sm outline-none text-zinc-600 dark:text-zinc-300"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <BaseButton variant="secondary" onClick={handleClose}>
              Done
            </BaseButton>
            <BaseButton onClick={() => {
              navigator.clipboard.writeText(url);
              toast.success('Copied to clipboard!');
            }}>
              Copy Link
            </BaseButton>
          </div>
        </div>
      </BaseDialog>
    );
  }

  return (
    <BaseDialog isOpen={isOpen} onClose={handleClose} title="Invite Member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
        {!organizationId && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Organization
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            >
              {organizations?.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        )}
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
