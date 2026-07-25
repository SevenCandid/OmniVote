import React from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useElection } from '../hooks/useElections';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { BaseButton } from '../../../components/ui/BaseButton';

export const ElectionSetupLayout: React.FC = () => {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: election, isLoading } = useElection(
    organizationId!,
    electionId!
  );

  if (isLoading) {
    return <BaseLoader />;
  }

  if (!election) {
    return <div>Election not found</div>;
  }

  const steps = [
    { id: 'settings', label: 'Election Settings' },
    { id: 'positions', label: 'Positions & Categories' },
    { id: 'candidates', label: 'Candidates' },
  ];

  const currentStepId = location.pathname.split('/').pop() || 'settings';
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  const handleNext = () => {
    if (currentStepIndex === steps.length - 1) {
      // Done with setup, go to overview
      navigate(`/dashboard/organizations/${organizationId}/elections/${electionId}`);
    } else {
      const nextStep = steps[currentStepIndex + 1];
      navigate(`/dashboard/organizations/${organizationId}/elections/${electionId}/setup/${nextStep.id}`);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col">
      {/* Header and Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Setup Election</h1>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            <CheckCircle className="w-3.5 h-3.5" />
            Draft Saved
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          You are configuring <span className="font-medium text-gray-700 dark:text-gray-300">{election.title}</span>
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-4">
          <div
            className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Steps Label */}
        <div className="flex justify-between text-xs font-medium text-gray-500">
          {steps.map((step, idx) => (
            <span
              key={step.id}
              className={`${idx <= currentStepIndex ? 'text-[var(--color-primary)]' : ''}`}
            >
              {idx + 1}. {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <Outlet />
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6">
        <div>
          {currentStepIndex > 0 && (
            <p className="text-sm text-gray-500">
              You can choose to skip this step and add them later from the dashboard.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {currentStepIndex > 0 && currentStepIndex < steps.length - 1 && (
            <BaseButton variant="secondary" onClick={handleSkip}>
              Skip for now
            </BaseButton>
          )}
          {currentStepIndex === steps.length - 1 && (
            <BaseButton variant="secondary" onClick={handleSkip}>
              Skip to Overview
            </BaseButton>
          )}
          
          <BaseButton onClick={handleNext}>
            {currentStepIndex === steps.length - 1 ? 'Complete Setup' : 'Next Step'}
          </BaseButton>
        </div>
      </div>
    </div>
  );
};
