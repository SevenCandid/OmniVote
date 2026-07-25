import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CandidateManagementPanel } from '../components/candidates/CandidateManagementPanel';

export default function CandidateManagementPage() {
  const { id: organizationId, electionId, categoryId } = useParams<{
    id: string;
    electionId: string;
    categoryId: string;
  }>();

  const location = useLocation();
  const isFromSetup = location.state?.fromSetup;
  const backLink = isFromSetup 
    ? `/dashboard/organizations/${organizationId}/elections/${electionId}/setup/candidates`
    : `/dashboard/organizations/${organizationId}/elections/${electionId}/candidates`;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-2">
        <Link 
          to={backLink}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to {isFromSetup ? 'Setup' : 'Categories'}
        </Link>
      </div>
      <CandidateManagementPanel 
        organizationId={organizationId!} 
        electionId={electionId!} 
        categoryId={categoryId!} 
      />
    </div>
  );
}
