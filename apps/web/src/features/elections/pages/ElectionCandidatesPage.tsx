import { useParams, Link } from 'react-router-dom';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { electionCategoryApi } from '../api/categoryApi';

export default function ElectionCandidatesPage() {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();


  const { data: categories, isLoading } = useQuery({
    queryKey: ['election-categories', organizationId, electionId],
    queryFn: () => electionCategoryApi.getAll(organizationId!, electionId!),
    enabled: !!organizationId && !!electionId,
  });

  if (isLoading) return <BaseLoader />;

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Positions/Categories Found</h3>
        <p className="mt-2 text-gray-500 max-w-sm">
          You need to create at least one position or category before you can add candidates.
        </p>
        <Link
          to={`/dashboard/organizations/${organizationId}/elections/${electionId}/positions`}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Go to Positions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Manage Candidates by Position
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Select a position below to add or manage its candidates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/dashboard/organizations/${organizationId}/elections/${electionId}/categories/${category.id}/candidates`}
            className="block p-6 bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {category.name}
            </h3>
            {category.description && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {category.description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 capitalize">
                {category.category_type.replace('_', ' ')}
              </span>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                Manage &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
