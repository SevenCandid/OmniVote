import { useState } from 'react';
import { BaseButton } from '@/components/ui/BaseButton';
import { BaseCard } from '@/components/ui/BaseCard';
import { useCandidates, useCreateCandidate, useUpdateCandidate, useReorderCandidate } from '../../hooks/useCandidates';
import { CandidateList } from './CandidateList';
import { CandidateCreateWizard } from './CandidateCreateWizard';
import { CandidateEditModal } from './CandidateEditModal';
import { CandidateCreateFormValues, CandidateUpdateFormValues } from '../../schemas/candidateSchema';
import { CandidateStatus, Candidate } from '../../types/candidate';

interface CandidateManagementPanelProps {
  organizationId: string;
  electionId: string;
  categoryId: string;
}

export function CandidateManagementPanel({ organizationId, electionId, categoryId }: CandidateManagementPanelProps) {
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'ALL'>('ALL');

  const { data: candidates = [], isLoading, error } = useCandidates(organizationId, electionId, categoryId);
  const createMutation = useCreateCandidate(organizationId, electionId, categoryId);
  const updateMutation = useUpdateCandidate(organizationId, electionId, categoryId);
  const reorderMutation = useReorderCandidate(organizationId, electionId, categoryId);

  const termSingular = 'Candidate';
  const termPlural = 'Candidates';

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (data: CandidateCreateFormValues) => {
    await createMutation.mutateAsync(data);
    setIsCreateWizardOpen(false);
  };

  const handleReorder = async (candidateId: string, newNumber: number) => {
    await reorderMutation.mutateAsync({ candidateId, data: { new_candidate_number: newNumber } });
  };

  const handleUpdateStatus = async (candidateId: string, status: CandidateStatus) => {
    await updateMutation.mutateAsync({ candidateId, data: { status } });
  };

  const handleEditClick = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (candidateId: string, data: CandidateUpdateFormValues) => {
    await updateMutation.mutateAsync({ candidateId, data });
    setIsEditModalOpen(false);
    setEditingCandidate(null);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading {termPlural.toLowerCase()}...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading {termPlural.toLowerCase()}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Manage {termPlural}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add and manage {termPlural.toLowerCase()} for this position
          </p>
        </div>
        <BaseButton onClick={() => setIsCreateWizardOpen(true)}>
          Add {termSingular}
        </BaseButton>
      </div>

      <BaseCard className="p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <input
            type="text"
            placeholder={`Search ${termPlural.toLowerCase()}...`}
            className="w-full sm:w-64 px-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="w-full sm:w-48 px-4 py-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CandidateStatus | 'ALL')}
          >
            <option value="ALL">All Statuses</option>
            <option value={CandidateStatus.ACTIVE}>Active</option>
            <option value={CandidateStatus.WITHDRAWN}>Withdrawn</option>
            <option value={CandidateStatus.DISQUALIFIED}>Disqualified</option>
          </select>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border rounded-md bg-gray-50">
            <p className="mb-4">No {termPlural.toLowerCase()} found.</p>
            {!searchQuery && statusFilter === 'ALL' && (
              <BaseButton variant="secondary" onClick={() => setIsCreateWizardOpen(true)}>
                Add your first {termSingular.toLowerCase()}
              </BaseButton>
            )}
          </div>
        ) : (
          <CandidateList
            candidates={filteredCandidates}
            onReorder={handleReorder}
            onUpdateStatus={handleUpdateStatus}
            onEdit={handleEditClick}
          />
        )}
      </BaseCard>

      {isCreateWizardOpen && (
        <CandidateCreateWizard
          isOpen={isCreateWizardOpen}
          onClose={() => setIsCreateWizardOpen(false)}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
          termSingular={termSingular}
        />
      )}

      {isEditModalOpen && (
        <CandidateEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCandidate(null);
          }}
          onSubmit={handleEditSubmit}
          isLoading={updateMutation.isPending}
          candidate={editingCandidate}
          termSingular={termSingular}
        />
      )}
    </div>
  );
}
