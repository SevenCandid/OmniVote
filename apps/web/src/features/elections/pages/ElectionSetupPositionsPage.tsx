import React from 'react';
import { useParams } from 'react-router-dom';
import { useElection } from '../hooks/useElections';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { ElectionCategoriesPanel } from '../components/categories/ElectionCategoriesPanel';

export const ElectionSetupPositionsPage: React.FC = () => {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();

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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Positions & Categories
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Create the positions that voters will cast ballots for.
        </p>
      </div>

      <ElectionCategoriesPanel election={election} hideManageCandidates={true} />
    </div>
  );
};
