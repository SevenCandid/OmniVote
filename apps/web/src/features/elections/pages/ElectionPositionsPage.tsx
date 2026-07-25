
import { useParams } from 'react-router-dom';
import { useElection } from '../hooks/useElections';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { ElectionCategoriesPanel } from '../components/categories/ElectionCategoriesPanel';

export default function ElectionPositionsPage() {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();

  const { data: election, isLoading } = useElection(
    organizationId!,
    electionId!
  );

  if (isLoading) return <BaseLoader />;
  if (!election) return <div>Election not found</div>;

  return (
    <div className="space-y-6">
      <ElectionCategoriesPanel election={election} />
    </div>
  );
}
