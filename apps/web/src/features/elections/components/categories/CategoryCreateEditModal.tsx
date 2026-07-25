import React, { useState, useEffect } from 'react';
import { 
  ElectionCategory, 
  ElectionCategoryCreate, 
  ElectionCategoryUpdate
} from '../../types';
import { CategoryType, VotingMethod } from '../../types/category';
import { X } from 'lucide-react';

interface CategoryCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ElectionCategoryCreate | ElectionCategoryUpdate) => Promise<void>;
  category: ElectionCategory | null; // If null, it's create mode.
  isSaving: boolean;
}

export const CategoryCreateEditModal: React.FC<CategoryCreateEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  isSaving,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category_type: CategoryType;
    max_winners: number;
    voting_method: VotingMethod;
  }>({
    name: '',
    description: '',
    category_type: CategoryType.POSITION,
    max_winners: 1,
    voting_method: VotingMethod.FIRST_PAST_THE_POST,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        category_type: category.category_type,
        max_winners: category.max_winners,
        voting_method: category.voting_method,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category_type: CategoryType.POSITION,
        max_winners: 1,
        voting_method: VotingMethod.FIRST_PAST_THE_POST,
      });
    }
  }, [category, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
            <button
              type="button"
              className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close panel</span>
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {category ? 'Edit Category / Position' : 'Create Category / Position'}
              </h3>
              
              <div className="mt-6">
                <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., President, Best Design"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="category_type" className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <select
                        name="category_type"
                        id="category_type"
                        value={formData.category_type}
                        onChange={handleChange}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value={CategoryType.POSITION}>Position / Office</option>
                        <option value={CategoryType.CATEGORY}>Category / Award</option>
                        <option value={CategoryType.PROPOSITION}>Proposition</option>
                        <option value={CategoryType.QUESTION}>Question</option>
                        <option value={CategoryType.CUSTOM}>Custom</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="voting_method" className="block text-sm font-medium text-gray-700">
                        Voting Method
                      </label>
                      <select
                        name="voting_method"
                        id="voting_method"
                        value={formData.voting_method}
                        onChange={handleChange}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value={VotingMethod.FIRST_PAST_THE_POST}>First Past The Post</option>
                        <option value={VotingMethod.RANKED_CHOICE}>Ranked Choice</option>
                        <option value={VotingMethod.APPROVAL}>Approval</option>
                        <option value={VotingMethod.SCORE}>Score</option>
                        <option value={VotingMethod.CUMULATIVE}>Cumulative</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="max_winners" className="block text-sm font-medium text-gray-700">
                      Maximum Winners
                    </label>
                    <input
                      type="number"
                      name="max_winners"
                      id="max_winners"
                      min={1}
                      required
                      value={formData.max_winners}
                      onChange={handleChange}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The number of candidates that can win this position/category.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              form="category-form"
              disabled={isSaving}
              className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm sm:ml-3 sm:w-auto sm:text-sm ${
                isSaving ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
