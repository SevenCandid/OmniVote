import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  ArrowLeft,
  Save,
  Globe,
  Lock,
  Users,
  Clock,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useCreateElection } from '../hooks/useElections';
import { useOrganization } from '../../organizations/hooks/useOrganizations';
import { ElectionType, Visibility } from '../types';

export default function ElectionCreatePage() {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const createMutation = useCreateElection();
  const { data: organization, isLoading: isOrgLoading } = useOrganization(
    organizationId || ''
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
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

  const onSubmit = async (data: any) => {
    // Format dates to ISO if provided, else null
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

    createMutation.mutate(
      { organizationId: organizationId!, data: payload },
      {
        onSuccess: (election) => {
          navigate(
            `/dashboard/organizations/${organizationId}/elections/${election.id}`
          );
        },
      }
    );
  };

  const advancedFeatures = [
    'Ballot Randomization',
    'Multiple Winners',
    'Weighted Voting',
    'Candidate Approval Workflow',
    'Election Observers',
    'Quorum Rules',
    'Tie-breaking Rules',
    'Public Live Results',
    'Election Password/PIN',
    'Notification Preferences',
    'Additional security controls',
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4 mb-6">
        <button
          onClick={() =>
            navigate(`/dashboard/organizations/${organizationId}/elections`)
          }
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 text-sm font-medium transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Back to Elections
        </button>
        <h1 className="text-2xl font-bold">Create New Election</h1>
        <p className="text-gray-500">
          Configure a new election for your organization.
        </p>
      </div>

      {createMutation.isError && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-md border border-red-200 dark:border-red-900 flex gap-2 items-center mb-6">
          <ShieldCheck size={18} />
          <span>
            {(createMutation.error as any)?.response?.data?.detail ||
              createMutation.error.message ||
              'Failed to create election'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General Information */}
        <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="text-lg font-medium">General Information</h3>
            <p className="text-sm text-gray-500 mt-1">
              Basic details about this election.
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Organization
              </label>
              <input
                type="text"
                value={
                  isOrgLoading
                    ? 'Loading...'
                    : organization?.name || organizationId
                }
                disabled
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-500 cursor-not-allowed"
              />
            </div>

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
                placeholder="e.g. 2026 Presidential Election"
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
                placeholder="Provide some context for voters..."
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
            <p className="text-sm text-gray-500 mt-1">
              Set the timeline for your election.
            </p>
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

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Optional Schedule Phases
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Advanced Settings Placeholder */}
        <div className="bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold uppercase rounded text-center">
            Coming Soon
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Advanced Settings
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            These features are currently in development and will be available in
            future updates.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {advancedFeatures.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500"
              >
                <Lock size={14} />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[160px]"
          >
            {createMutation.isPending ? (
              <span className="animate-pulse">Creating...</span>
            ) : (
              <>
                <Save size={18} />
                Create Election
              </>
            )}
          </button>
        </div>

        {createMutation.isError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            Failed to create election. Please verify your inputs and try again.
          </div>
        )}
      </form>
    </div>
  );
}
