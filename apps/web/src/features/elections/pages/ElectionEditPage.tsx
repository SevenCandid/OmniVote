import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, Settings, ShieldCheck, Clock } from 'lucide-react';
import { useElection, useUpdateElection } from '../hooks/useElections';
import { ElectionType, Visibility } from '../types';
import { BaseLoader } from '../../../components/ui/BaseLoader';

export default function ElectionEditPage() {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();
  const navigate = useNavigate();

  const { data: election, isLoading } = useElection(
    organizationId!,
    electionId!
  );
  const updateMutation = useUpdateElection();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      election_type: ElectionType.CUSTOM,
      visibility: Visibility.PRIVATE,
      registration_opens_at: '',
      registration_closes_at: '',
      voting_opens_at: '',
      voting_closes_at: '',
      results_publish_at: '',
      timezone: 'UTC',
      allow_anonymous_voting: false,
      automatically_publish_results: false,
      require_voter_verification: false,
    },
  });

  useEffect(() => {
    if (election) {
      const formatDateForInput = (dateStr: string | null) => {
        if (!dateStr) return '';
        // Format to YYYY-MM-DDThh:mm for datetime-local input
        const d = new Date(dateStr);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
      };

      reset({
        title: election.title,
        description: election.description || '',
        election_type: election.election_type,
        visibility: election.visibility,
        registration_opens_at: formatDateForInput(
          election.registration_opens_at
        ),
        registration_closes_at: formatDateForInput(
          election.registration_closes_at
        ),
        voting_opens_at: formatDateForInput(election.voting_opens_at),
        voting_closes_at: formatDateForInput(election.voting_closes_at),
        results_publish_at: formatDateForInput(election.results_publish_at),
        timezone: election.timezone,
        allow_anonymous_voting: election.allow_anonymous_voting,
        automatically_publish_results: election.automatically_publish_results,
        require_voter_verification: election.require_voter_verification,
      });
    }
  }, [election, reset]);

  const onSubmit = async (data: any) => {
    const formatDateTime = (val: string) =>
      val ? new Date(val).toISOString() : null;

    const payload = {
      ...data,
      registration_opens_at: formatDateTime(data.registration_opens_at),
      registration_closes_at: formatDateTime(data.registration_closes_at),
      voting_opens_at: formatDateTime(data.voting_opens_at),
      voting_closes_at: formatDateTime(data.voting_closes_at),
      results_publish_at: formatDateTime(data.results_publish_at),
    };

    updateMutation.mutate(
      {
        organizationId: organizationId!,
        electionId: electionId!,
        data: payload,
      },
      {
        onSuccess: () => {
          navigate(
            `/dashboard/organizations/${organizationId}/elections/${electionId}`
          );
        },
      }
    );
  };

  if (isLoading) return <BaseLoader />;
  if (!election) return <div>Election not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Edit Election Details</h2>
          <p className="text-gray-500 text-sm mt-1">
            Update information and schedule.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General Information */}
        <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="text-lg font-medium">General Information</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Election Title *
              </label>
              <input
                {...register('title', {
                  required: 'Title is required',
                  minLength: 3,
                })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow"
              />
              {errors.title && (
                <span className="text-red-500 text-xs mt-1 block">
                  {(errors.title as any).message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Election Type
                </label>
                <select
                  {...register('election_type')}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                >
                  <option value={ElectionType.CUSTOM}>Custom</option>
                  <option value={ElectionType.GENERAL_ELECTION}>
                    General Election
                  </option>
                  <option value={ElectionType.REFERENDUM}>Referendum</option>
                  <option value={ElectionType.SURVEY}>Survey</option>
                  <option value={ElectionType.POLL}>Poll</option>
                  <option value={ElectionType.AWARD_VOTING}>
                    Award Voting
                  </option>
                  <option value={ElectionType.COMMITTEE_ELECTION}>
                    Committee Election
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Visibility
                </label>
                <select
                  {...register('visibility')}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                >
                  <option value={Visibility.PRIVATE}>
                    Private (Invite Only)
                  </option>
                  <option value={Visibility.ORGANIZATION_ONLY}>
                    Organization Only
                  </option>
                  <option value={Visibility.UNLISTED}>
                    Unlisted (Link Only)
                  </option>
                  <option value={Visibility.PUBLIC}>Public</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />
              Schedule
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Voting Opens *
                </label>
                <input
                  type="datetime-local"
                  {...register('voting_opens_at', { required: 'Required' })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
                {errors.voting_opens_at && (
                  <span className="text-red-500 text-xs mt-1 block">
                    Required
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Voting Closes *
                </label>
                <input
                  type="datetime-local"
                  {...register('voting_closes_at', { required: 'Required' })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
                {errors.voting_closes_at && (
                  <span className="text-red-500 text-xs mt-1 block">
                    Required
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Registration Opens
                </label>
                <input
                  type="datetime-local"
                  {...register('registration_opens_at')}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Registration Closes
                </label>
                <input
                  type="datetime-local"
                  {...register('registration_closes_at')}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Results Publication
                </label>
                <input
                  type="datetime-local"
                  {...register('results_publish_at')}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Settings size={18} className="text-gray-500" />
              Configuration
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="max-w-md">
              <label className="block text-sm font-medium mb-2">
                Time Zone
              </label>
              <select
                {...register('timezone')}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">
                  Eastern Time (US & Canada)
                </option>
                <option value="America/Chicago">
                  Central Time (US & Canada)
                </option>
                <option value="America/Denver">
                  Mountain Time (US & Canada)
                </option>
                <option value="America/Los_Angeles">
                  Pacific Time (US & Canada)
                </option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Africa/Accra">Accra</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="flex items-center h-5 mt-1">
                  <input
                    type="checkbox"
                    {...register('allow_anonymous_voting')}
                    className="w-4 h-4 text-[var(--color-primary)] rounded border-gray-300 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium">
                    Allow Anonymous Voting
                  </span>
                  <span className="block text-sm text-gray-500">
                    Permit voters to cast ballots without associating their
                    identity with the vote.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <div className="flex items-center h-5 mt-1">
                  <input
                    type="checkbox"
                    {...register('automatically_publish_results')}
                    className="w-4 h-4 text-[var(--color-primary)] rounded border-gray-300 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium">
                    Automatically Publish Results
                  </span>
                  <span className="block text-sm text-gray-500">
                    Results will be made visible as soon as voting closes.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <div className="flex items-center h-5 mt-1">
                  <input
                    type="checkbox"
                    {...register('require_voter_verification')}
                    className="w-4 h-4 text-[var(--color-primary)] rounded border-gray-300 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium flex items-center gap-1.5">
                    Require Voter Verification
                    <ShieldCheck size={14} className="text-green-500" />
                  </span>
                  <span className="block text-sm text-gray-500">
                    Voters must complete an extra verification step (e.g. OTP)
                    before casting.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/dashboard/organizations/${organizationId}/elections/${electionId}`
              )
            }
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[160px]"
          >
            {updateMutation.isPending ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>

        {updateMutation.isError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            Failed to update election. Please verify your inputs and try again.
          </div>
        )}
      </form>
    </div>
  );
}
