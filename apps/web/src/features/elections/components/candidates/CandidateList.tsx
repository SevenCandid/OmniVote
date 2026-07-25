
import { Candidate, CandidateStatus } from '../../types/candidate';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { BaseButton } from '@/components/ui/BaseButton';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';

interface CandidateListProps {
  candidates: Candidate[];
  onReorder: (candidateId: string, newNumber: number) => void;
  onUpdateStatus: (candidateId: string, status: CandidateStatus) => void;
  onEdit: (candidate: Candidate) => void;
}

export function CandidateList({ candidates, onReorder, onUpdateStatus, onEdit }: CandidateListProps) {
  const [candidateToWithdraw, setCandidateToWithdraw] = useState<string | null>(null);

  const getStatusBadge = (status: CandidateStatus) => {
    switch (status) {
      case CandidateStatus.ACTIVE:
        return <BaseBadge variant="success">Active</BaseBadge>;
      case CandidateStatus.WITHDRAWN:
        return <BaseBadge variant="warning">Withdrawn</BaseBadge>;
      case CandidateStatus.DISQUALIFIED:
        return <BaseBadge variant="danger">Disqualified</BaseBadge>;
      default:
        return <BaseBadge variant="secondary">{status}</BaseBadge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-sm text-gray-500">
            <th className="py-3 px-4 font-medium">Order</th>
            <th className="py-3 px-4 font-medium">Photo</th>
            <th className="py-3 px-4 font-medium">Name</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium">Profile Completeness</th>
            <th className="py-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {candidates.map((candidate, index) => (
            <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      disabled={index === 0}
                      onClick={() => onReorder(candidate.id, candidate.candidate_number - 1)}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ArrowUpIcon size={14} />
                    </button>
                    <button
                      disabled={index === candidates.length - 1}
                      onClick={() => onReorder(candidate.id, candidate.candidate_number + 1)}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ArrowDownIcon size={14} />
                    </button>
                  </div>
                  <span className="font-semibold text-lg text-gray-700 w-8 text-center">
                    #{candidate.candidate_number}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500">
                  {candidate.photo ? (
                    <img src={candidate.photo} alt={candidate.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs">No img</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 font-medium text-gray-900">{candidate.full_name}</td>
              <td className="py-3 px-4">{getStatusBadge(candidate.status)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${candidate.profile_completeness}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{candidate.profile_completeness}%</span>
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <BaseButton variant="secondary" size="sm" onClick={() => onEdit(candidate)}>
                    Edit
                  </BaseButton>
                  {candidate.status === CandidateStatus.ACTIVE && (
                    <BaseButton variant="danger" size="sm" onClick={() => setCandidateToWithdraw(candidate.id)}>
                      Withdraw
                    </BaseButton>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        isOpen={!!candidateToWithdraw}
        onClose={() => setCandidateToWithdraw(null)}
        onConfirm={() => {
          if (candidateToWithdraw) {
            onUpdateStatus(candidateToWithdraw, CandidateStatus.WITHDRAWN);
            setCandidateToWithdraw(null);
          }
        }}
        title="Withdraw Candidate"
        description="Are you sure you want to withdraw this candidate? This action will mark them as withdrawn."
        variant="danger"
        confirmText="Withdraw"
      />
    </div>
  );
}
