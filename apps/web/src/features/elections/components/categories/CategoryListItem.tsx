import React from 'react';
import { 
  ElectionCategory, 
  CategoryType, 
  VotingMethod 
} from '../../types';
import { 
  ChevronUp, 
  ChevronDown, 
  Pencil, 
  Trash2,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';

interface CategoryListItemProps {
  category: ElectionCategory;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEdit: (category: ElectionCategory) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
  organizationId: string;
  hideManageCandidates?: boolean;
}

const CategoryTypeLabels: Record<CategoryType, string> = {
  [CategoryType.POSITION]: 'Position / Office',
  [CategoryType.CATEGORY]: 'Category / Award',
  [CategoryType.PROPOSITION]: 'Proposition / Measure',
  [CategoryType.QUESTION]: 'Question',
  [CategoryType.CUSTOM]: 'Custom',
};

const VotingMethodLabels: Record<VotingMethod, string> = {
  [VotingMethod.FIRST_PAST_THE_POST]: 'First Past The Post',
  [VotingMethod.RANKED_CHOICE]: 'Ranked Choice Voting',
  [VotingMethod.APPROVAL]: 'Approval Voting',
  [VotingMethod.SCORE]: 'Score Voting',
  [VotingMethod.CUMULATIVE]: 'Cumulative Voting',
};

export const CategoryListItem: React.FC<CategoryListItemProps> = ({
  category,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  disabled = false,
  organizationId,
  hideManageCandidates = false,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm mb-3">
      <div className="flex items-center space-x-4">
        {/* Ordering Controls */}
        <div className="flex flex-col space-y-1">
            <button
              onClick={() => onMoveUp(category.id)}
              disabled={isFirst || disabled}
              className={`p-1 rounded-md ${
                isFirst || disabled ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Move Up"
            >
              <ChevronUp size={20} />
            </button>
            <button
              onClick={() => onMoveDown(category.id)}
              disabled={isLast || disabled}
              className={`p-1 rounded-md ${
                isLast || disabled ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Move Down"
            >
              <ChevronDown size={20} />
            </button>
        </div>

        {/* Content */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
          {category.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{category.description}</p>
          )}
          <div className="flex space-x-3 mt-2 text-xs text-gray-500">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {CategoryTypeLabels[category.category_type]}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              {VotingMethodLabels[category.voting_method]}
            </span>
            <span className="inline-flex items-center">
              Max Winners: {category.max_winners}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(category)}
              disabled={disabled}
              className={`p-1 rounded-md ${disabled ? 'text-gray-300' : 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
              title="Edit"
            >
              <Pencil size={20} />
            </button>
            {!hideManageCandidates && (
              <Link
                to={`/dashboard/organizations/${organizationId}/elections/${category.election_id}/categories/${category.id}/candidates`}
                className={`p-1 rounded-md text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20`}
                title="Manage Candidates"
              >
                <Users size={20} />
              </Link>
            )}
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={disabled}
              className={`p-1 rounded-md ${disabled ? 'text-gray-300' : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          setIsDeleteDialogOpen(false);
          onDelete(category.id);
        }}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
      />
    </div>
  );
};
