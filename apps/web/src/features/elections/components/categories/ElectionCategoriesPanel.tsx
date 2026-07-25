import React, { useState, useEffect } from 'react';
import { 
  Election, 
  ElectionCategory, 
  ElectionStatus,
  ElectionCategoryCreate,
  ElectionCategoryUpdate
} from '../../types';
import { electionCategoryApi } from '../../api/categoryApi';
import { CategoryListItem } from './CategoryListItem';
import { CategoryCreateEditModal } from './CategoryCreateEditModal';
import { Plus } from 'lucide-react';

interface ElectionCategoriesPanelProps {
  election: Election;
  hideManageCandidates?: boolean;
}

export const ElectionCategoriesPanel: React.FC<ElectionCategoriesPanelProps> = ({ election, hideManageCandidates = false }) => {
  const [categories, setCategories] = useState<ElectionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedAutoOpen, setHasCheckedAutoOpen] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ElectionCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditable = [ElectionStatus.DRAFT, ElectionStatus.CONFIGURED].includes(election.status);

  useEffect(() => {
    fetchCategories();
  }, [election.id]);

  useEffect(() => {
    if (!isLoading && !hasCheckedAutoOpen) {
      if (categories.length === 0 && isEditable) {
        setIsModalOpen(true);
      }
      setHasCheckedAutoOpen(true);
    }
  }, [isLoading, categories.length, isEditable, hasCheckedAutoOpen]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await electionCategoryApi.getAll(election.organization_id, election.id);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: ElectionCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async (data: ElectionCategoryCreate | ElectionCategoryUpdate) => {
    try {
      setIsSaving(true);
      if (editingCategory) {
        await electionCategoryApi.update(
          election.organization_id,
          election.id,
          editingCategory.id,
          data as ElectionCategoryUpdate
        );
      } else {
        await electionCategoryApi.create(
          election.organization_id,
          election.id,
          data as ElectionCategoryCreate
        );
      }
      await fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      alert(`Error saving category: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await electionCategoryApi.delete(election.organization_id, election.id, id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(`Error deleting category: ${err.message}`);
    }
  };

  const handleMoveUp = async (id: string) => {
    const index = categories.findIndex((c) => c.id === id);
    if (index <= 0) return;
    
    const prevCategory = categories[index - 1];
    const newOrder = prevCategory.display_order;

    try {
      // Optimistic update
      const newCats = [...categories];
      const temp = newCats[index];
      newCats[index] = newCats[index - 1];
      newCats[index - 1] = temp;
      setCategories(newCats);

      await electionCategoryApi.updateOrder(election.organization_id, election.id, id, newOrder);
      await fetchCategories(); // Refresh fully
    } catch (err: any) {
      alert(`Failed to reorder: ${err.message}`);
      await fetchCategories(); // Rollback
    }
  };

  const handleMoveDown = async (id: string) => {
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1 || index >= categories.length - 1) return;
    
    const nextCategory = categories[index + 1];
    const newOrder = nextCategory.display_order;

    try {
      // Optimistic update
      const newCats = [...categories];
      const temp = newCats[index];
      newCats[index] = newCats[index + 1];
      newCats[index + 1] = temp;
      setCategories(newCats);

      await electionCategoryApi.updateOrder(election.organization_id, election.id, id, newOrder);
      await fetchCategories(); // Refresh fully
    } catch (err: any) {
      alert(`Failed to reorder: ${err.message}`);
      await fetchCategories(); // Rollback
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading categories...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Categories & Positions
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage the positions, awards, or questions for this election.
          </p>
        </div>
        {isEditable && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
            Add Category
          </button>
        )}
      </div>
      
      <div className="p-4 sm:p-6">
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {!isEditable && categories.length > 0 && (
          <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-md">
            Categories cannot be modified because the election is currently {election.status}.
          </div>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No categories have been added yet.</p>
            {isEditable && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-3 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Add your first category
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category, index) => (
              <CategoryListItem
                key={category.id}
                category={category}
                isFirst={index === 0}
                isLast={index === categories.length - 1}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteCategory}
                disabled={!isEditable}
                organizationId={election.organization_id}
                hideManageCandidates={hideManageCandidates}
              />
            ))}
          </div>
        )}
      </div>

      <CategoryCreateEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        category={editingCategory}
        isSaving={isSaving}
      />
    </div>
  );
};
