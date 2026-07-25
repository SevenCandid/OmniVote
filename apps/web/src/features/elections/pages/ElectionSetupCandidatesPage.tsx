import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { electionCategoryApi } from '../api/categoryApi';
import { useCandidates } from '../hooks/useCandidates';
import { CandidateManagementPanel } from '../components/candidates/CandidateManagementPanel';

const TabLabel = ({ organizationId, electionId, categoryId, categoryName }: { organizationId: string, electionId: string, categoryId: string, categoryName: string }) => {
  const { data: candidates } = useCandidates(organizationId, electionId, categoryId);
  return (
    <span className="flex items-center gap-2">
      {categoryName}
      {candidates !== undefined && (
        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs font-medium">
          {candidates.length}
        </span>
      )}
    </span>
  );
};

export const ElectionSetupCandidatesPage: React.FC = () => {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['election-categories', organizationId, electionId],
    queryFn: () => electionCategoryApi.getAll(organizationId!, electionId!),
    enabled: !!organizationId && !!electionId,
  });

  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  if (isLoading) return <BaseLoader />;

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Positions Found</h3>
        <p className="mt-2 text-gray-500 max-w-sm">
          You need to create at least one position or category before you can add candidates. Go back to the previous step.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 bg-white dark:bg-[#18181B] pt-2">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`${
                selectedCategoryId === category.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <TabLabel
                organizationId={organizationId!}
                electionId={electionId!}
                categoryId={category.id}
                categoryName={category.name}
              />
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-2">
        {selectedCategoryId && (
          <div key={selectedCategoryId} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CandidateManagementPanel
              organizationId={organizationId!}
              electionId={electionId!}
              categoryId={selectedCategoryId}
            />
          </div>
        )}
      </div>
    </div>
  );
};
