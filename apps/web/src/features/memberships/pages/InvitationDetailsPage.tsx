import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { membershipApi } from '../services/membershipApi';
import { InvitationStatus } from '../schemas/invitationSchema';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { Building2, Mail, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAcceptInvitation, useDeclineInvitation } from '../hooks/useMemberships';
import { toast } from 'react-hot-toast';
import { useSessionStore } from '../../../stores/sessionStore';

export default function InvitationDetailsPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useSessionStore((state) => !!state.accessToken);
  
  const { mutateAsync: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { mutateAsync: declineInvitation, isPending: isDeclining } = useDeclineInvitation();

  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ['invitationDetails', token],
    queryFn: () => membershipApi.getInvitationDetails(token!),
    enabled: !!token,
    retry: false, // Don't retry on 404
  });

  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Typically, redirect to register with next=/invite/:token
      navigate('/auth/register', { state: { returnTo: `/invite/${token}` } });
      return;
    }
    
    try {
      await acceptInvitation(token!);
      toast.success('Invitation accepted!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept invitation');
    }
  };

  const handleDecline = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { returnTo: `/invite/${token}` } });
      return;
    }

    try {
      await declineInvitation(token!);
      toast.success('Invitation declined');
      navigate('/dashboard/invitations');
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline invitation');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-zinc-500">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
        <BaseCard className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Invalid or Expired Invitation</h1>
          <p className="text-zinc-500 pb-4">
            {error ? (error as any).message : 'This invitation link is invalid, has expired, or has already been used.'}
          </p>
          <BaseButton className="w-full" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </BaseButton>
        </BaseCard>
      </div>
    );
  }

  // If already accepted/declined/expired, show status
  if (invitation.status !== InvitationStatus.PENDING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
        <BaseCard className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Invitation {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}</h1>
          <p className="text-zinc-500 pb-4">
            This invitation to join <strong>{invitation.organization_name}</strong> is no longer pending.
          </p>
          <BaseButton className="w-full" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </BaseButton>
        </BaseCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 mb-6">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">You've been invited!</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            {invitation.invited_by_name || 'An administrator'} has invited you to join <strong>{invitation.organization_name}</strong> on OmniVote.
          </p>
        </div>

        <BaseCard className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
              <Mail className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-sm font-medium">Invited Email</p>
                <p className="text-sm text-zinc-500">{invitation.recipient_email}</p>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm">
                You'll need to create an account or sign in with this email address to accept the invitation.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <BaseButton
                variant="secondary"
                className="w-full"
                onClick={handleDecline}
                isLoading={isDeclining}
                disabled={isAccepting}
              >
                Decline
              </BaseButton>
              <BaseButton
                className="w-full"
                onClick={handleAccept}
                isLoading={isAccepting}
                disabled={isDeclining}
              >
                {isAuthenticated ? 'Accept Invitation' : 'Sign Up to Accept'}
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  );
}
