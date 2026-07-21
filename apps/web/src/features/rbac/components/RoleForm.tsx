import React from 'react';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import { PermissionSelector } from './PermissionSelector';

export interface RoleFormData {
  name: string;
  description: string;
  permissionIds: string[];
}

interface RoleFormProps {
  initialData?: Partial<RoleFormData>;
  onSubmit: (data: RoleFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  isCreate?: boolean;
}

export function RoleForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  disabled = false,
  isCreate = false,
}: RoleFormProps) {
  const [formData, setFormData] = React.useState<RoleFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    permissionIds: initialData?.permissionIds || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <BaseInput
          label="Role Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g. Content Manager"
          disabled={disabled}
          required
        />
        <BaseInput
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="What does this role do?"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Permissions
        </h3>
        <p className="text-xs text-zinc-500 pb-2">
          Select the permissions this role grants to members.
        </p>
        <PermissionSelector
          selectedIds={formData.permissionIds}
          onChange={(ids) =>
            setFormData((prev) => ({ ...prev, permissionIds: ids }))
          }
          disabled={disabled}
        />
      </div>

      {!disabled && (
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {onCancel && (
            <BaseButton type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </BaseButton>
          )}
          <BaseButton
            type="submit"
            disabled={!formData.name || isLoading}
            isLoading={isLoading}
          >
            {isCreate ? 'Create Role' : 'Save Changes'}
          </BaseButton>
        </div>
      )}
    </form>
  );
}
